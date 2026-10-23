// 导入LLM接口
import { AbortError, isAbortError } from "@/apis";
import {
  createResumeAgentSession,
  describeResumeAiError,
  type ResumeAgentSession,
} from "@snowflake/resume-agent";
import type { ChatMessage } from "@snowflake/ai";
import { resumeContextCompaction } from "@/apis/llm/contextCompaction";
import { useAiStore, useResumeStore } from "@/stores";
// 导入聊天和消息类型
import type { Chat, Message } from "@/stores/modules/ai";
// 导入Vue组合式API相关类型
import { onUnmounted, type ComputedRef, type Ref } from "vue";
import { storeToRefs } from "pinia";
// 宿主传入的请求配置：技能与工具由调用方组装，chat 不内置业务内容
import type { AssistantConfig } from "../types";
// 导入默认提示词，每次请求提级到用户消息前避免遗忘规则
import { defaultPrompt } from "../routing/defaultPrompt";
// 定义 useChatRequest 的配置选项接口
interface UseChatRequestOptions {
  chat: Ref<Chat>; // 当前聊天会话
  currentMessages: ComputedRef<Message[]>; // 当前消息列表（只读）
  addMessage: (message: Partial<Message>) => void; // 添加消息的方法
  scrollToBottom: () => void | Promise<void>; // 滚动到底部
  config: AssistantConfig; // 调用方注入的技能、工具与上下文处理
}

// 主组合式函数：根据调用方注入的配置处理AI聊天请求
export const useChatRequest = ({
  chat,
  currentMessages,
  addMessage,
  scrollToBottom,
  config,
}: UseChatRequestOptions) => {
  const aiStore = useAiStore();
  const resumeStore = useResumeStore();
  const { thinkMode } = storeToRefs(aiStore);
  const { generating, beforeRequest, afterRequest, resolveTools, reflectPrompt, onToolError } =
    config;
  // 简历来自响应式 Store，使用可序列化副本备份并保留媒体以支持删除、排序撤回
  const captureBackup = () => {
    const item = resumeStore.currentItem;
    if (!item) return null;
    return {
      // 备份所属简历，禁止跨简历恢复
      resumeId: item.id,
      // 请求前完整业务数据，含原始记录对应的媒体
      data: JSON.parse(JSON.stringify(item.data ?? {})),
      // 请求前模块配置
      config: JSON.parse(JSON.stringify(item.config ?? {})),
      // 请求前展示语言，翻译撤回时一并恢复
      language: item.ui?.content?.language,
    };
  };
  const restoreBackup = (backup: any) => {
    const item = resumeStore.currentItem;
    if (!item || !backup || item.id !== backup.resumeId) return false;
    // 恢复原始记录与其媒体，避免删除或排序后按新下标错配图片
    item.data = JSON.parse(JSON.stringify(backup.data ?? {}));
    resumeStore.restoreConfig(backup.config);
    if (item.ui?.content) item.ui.content.language = backup.language;
    return true;
  };
  // 每条 AI 回复对应的请求前简历备份，用于“撤回修改”
  const requestBackups = new WeakMap<object, unknown>();
  // 真实产生过写入的消息（用于控制“撤回修改”按钮显隐）
  const writeMessages = new WeakSet<object>();
  // 当前 think 轮次流式输出的正文缓冲：未确认是最终输出轮前不直接展示为正文
  let stepContent = "";
  // 是否进入反思轮：反思轮的 content 直接实时渲染为正文
  let streamFinalContent = false;
  // 最终回复正文是否已开始输出：执行过程完成标记与自动折叠只在首个正文分片触发一次
  let finalContentStarted = false;
  // 用于取消当前请求的函数引用
  let abortRequest: (() => void) | null = null;
  // 当前简历 Agent 会话引用，用于中止统一执行链。
  let agentSession: ResumeAgentSession | null = null;
  // 请求版本号，用于避免旧请求干扰
  let requestVersion = 0;
  // 组件是否已卸载标记
  let isUnmounted = false;
  type ChatTimers = {
    thinking: ReturnType<typeof setInterval> | null;
    reply: ReturnType<typeof setInterval> | null;
  };
  let activeTimers: ChatTimers | null = null;

  // 清理思考和回复计时器
  const clearTimers = (timers: ChatTimers) => {
    if (timers.thinking) clearInterval(timers.thinking);
    if (timers.reply) clearInterval(timers.reply);
    timers.thinking = null;
    timers.reply = null;
  };

  // 工具调用过程区展示用的中文名
  // 工具动作面向用户描述，避免把内部工具名直接展示给用户
  const TOOL_NAMES: Record<string, string> = {
    plan_resume_task: "理解需求",
    request_resume_input: "确认补充信息",
    report_resume_blocker: "记录阻塞原因",
    read_resume_data: "读取简历",
    propose_resume_edits: "写入简历",
    read_resume_guidance: "查阅写作知识",
    update_resume_language: "同步简历语言",
  };

  // 独立处理思考、正文和令牌回调，维护请求状态与耗时计数。
  const createChatState = (
    lastMsg: Message | null,
    isCurrent: () => boolean,
    onUsage: (tokens: number) => void,
  ) => {
    const timers: ChatTimers = { thinking: null, reply: null };
    activeTimers = timers;

    const onReasoning = () => {
      if (!isCurrent() || !lastMsg) return;
      lastMsg.requestStatus = "thinking";
      lastMsg.stepLabel = "正在深度思考…";
      if (!timers.thinking) {
        timers.thinking = setInterval(() => {
          if (isCurrent()) lastMsg.thoughtTime += 1;
        }, 1000);
      }
    };

    const onContent = (data: string) => {
      if (!isCurrent() || !lastMsg) return;
      lastMsg.requestStatus = "generating";
      lastMsg.stepLabel = "正在生成回复…";
      if (data) {
        if (streamFinalContent) {
          // 最终回复正文开始输出：执行过程视为已结束，折叠执行过程并切换完成标记
          if (!finalContentStarted) {
            finalContentStarted = true;
            lastMsg.thoughtCollapsed = true;
          }
          // 反思轮（最终输出）：实时写入正文，边生成边渲染
          lastMsg.content = `${lastMsg.content || ""}${data}`;
          scrollToBottom();
        } else {
          // 未确认是最终输出轮前只缓冲，不写入思考区也不写入正文
          stepContent += data;
        }
      }
      if (!timers.reply) {
        if (timers.thinking) clearInterval(timers.thinking);
        timers.thinking = null;
        timers.reply = setInterval(() => {
          if (isCurrent()) lastMsg.contentTime += 1;
        }, 1000);
      }
    };

    const onToken = (totalTokens: number) => {
      if (!isCurrent() || !lastMsg) return;
      onUsage(totalTokens);
    };

    const dispose = () => {
      clearTimers(timers);
      if (activeTimers === timers) activeTimers = null;
    };

    return { onReasoning, onContent, onToken, dispose };
  };

  /**
   * 发送 AI 请求并记录思考与回复耗时
   */
  const handleAIResponse = async () => {
    // 增加请求版本，用于判断当前请求是否有效
    const currentRequestVersion = ++requestVersion;
    const requestResumeId = resumeStore.currentItem?.id || "";
    const requestChatId = chat.value?.id || "";
    const requestTaskId = `${requestResumeId}:${currentRequestVersion}`;
    // 请求前备份简历，撤回修改时恢复
    const backup = captureBackup?.();
    stepContent = "";
    streamFinalContent = false;
    finalContentStarted = false;
    // 辅助函数：检查当前请求是否仍为最新且组件未卸载
    const isCurrentRequest = () =>
      !isUnmounted &&
      currentRequestVersion === requestVersion &&
      resumeStore.currentItem?.id === requestResumeId &&
      chat.value?.id === requestChatId;
    // 资源加载期间保留统一取消入口，ReAct 创建后由编排器接管中止。
    const taskAbortController = new AbortController();
    abortRequest = () => taskAbortController.abort();
    // 设置生成状态为true
    generating.value = true;
    // 最后一条消息（即AI回复消息）的引用与状态处理器
    let lastMsg: Message | null = null;
    let state: ReturnType<typeof createChatState> | null = null;
    let totalTokenUsage = 0;
    // 累加 ReAct 每一轮模型请求返回的 token 用量
    const addTokenUsage = (value: unknown) => {
      const tokens = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(tokens) || tokens <= 0) return;
      totalTokenUsage += tokens;
      if (lastMsg) lastMsg.total_tokens = totalTokenUsage;
    };

    try {
      // 请求前由调用方准备本轮读取范围
      // 请求读取范围跟随最后一条用户消息持久化，重试与重新生成时保持一致
      const requestMessage = [...currentMessages.value]
        .reverse()
        .find((message) => message.role === "user");
      const entryFlow = requestMessage?.requestContext?.entryFlow;
      beforeRequest?.(requestMessage?.requestContext, requestTaskId);
      // 构建消息列表（只复制 role 和 content，跳过带上下文标记的引导对话）
      const defaultSkill = defaultPrompt();
      // 最近任务状态交给同一个 Agent 承接“继续”“再短一点”等省略表达。
      const previousTask = [...currentMessages.value]
        .reverse()
        .find((message) => message.resumeTask)?.resumeTask;
      let messages = currentMessages.value
        .filter(
          (message) =>
            !message.skipContext &&
            message.systemSkillId !== defaultSkill.id &&
            !message.systemSkillId &&
            !(
              message.role === "system" &&
              message.content.includes("# 角色\n你是叫小舟AI助手") &&
              message.content.includes("# 任务分派")
            ),
        )
        .map((message) => ({
          // 会话只接受协议固定的角色枚举，历史记录里存的是普通字符串
          role: message.role as ChatMessage["role"],
          content: message.content,
        }));
      // 动态提级默认提示词：先移除所有已存在的默认提示，再插入到最后一个用户消息之前
      // 确保每次请求规则都紧邻用户问题，避免长对话遗忘导致幻觉
      // 找到最后一个用户消息位置
      const lastUserIndex = messages.map((message) => message.role).lastIndexOf("user");
      if (lastUserIndex !== -1) {
        // 默认规则紧邻本轮请求，任务运行上下文随后与本轮请求放在一起。
        messages.splice(
          lastUserIndex,
          0,
          { role: "system", content: defaultSkill.instructions },
        );
      }
      const lastInput = messages.at(-1);
      if (!lastInput) return;

      // 添加一条空的AI回复消息（打字状态）
      addMessage({
        role: "assistant",
        content: "",
        typing: true,
      });
      // 获取刚添加的AI消息引用
      lastMsg = currentMessages.value[currentMessages.value.length - 1] ?? null;
      if (lastMsg && backup != null) requestBackups.set(lastMsg, backup);
      state = createChatState(lastMsg, isCurrentRequest, addTokenUsage);
      // 运行观测：从请求开始记录任务契约、工具证据与完成校验结论
      if (lastMsg) {
        lastMsg.agentRun = {
          taskId: requestTaskId,
          source: typeof entryFlow === "string" ? entryFlow : "chat",
          startedAt: Date.now(),
          steps: [],
          verdicts: [],
        };
      }
      // 请求开始即启动计时，避免首个模型事件返回前没有耗时
      state.onReasoning();

      // 首次请求时才加载能力与简历工具清单，跨轮承接由任务状态负责。
      const { tools: resolvedTools, capabilities: resolvedCapabilities, taskProfile } = await resolveTools(requestMessage?.requestContext);
      // 加载期间取消或切换会话时不再启动请求，工具执行前再次核对所属任务
      if (!isCurrentRequest()) return;
      // 简历 Agent 会话统一解析入口任务、装配工具并启动 ReAct。
      agentSession = await createResumeAgentSession({
        taskId: requestTaskId,
        source: typeof entryFlow === "string" ? entryFlow : "chat",
        // 规划缺省时用本轮用户原话回填任务目标
        fallbackObjective: requestMessage?.content,
        previousTask,
        capabilities: resolvedCapabilities,
        tools: resolvedTools,
        taskProfile,
        assertActive: () => {
          if (!isCurrentRequest()) throw new AbortError();
        },
        onEvidence: (evidence) => {
          if (!isCurrentRequest() || !lastMsg) return;
          // 观测：完整记录每次工具事实，复用结果也保留
          lastMsg.agentRun?.steps.push({
            sequence: evidence.sequence,
            tool: evidence.tool,
            status: evidence.status,
            summary: evidence.summary,
            changed: evidence.changed,
            facts: evidence.facts,
            replayed: evidence.replayed,
            at: Date.now(),
          });
          if (evidence.replayed) return;
          // 证据摘要本身是用户可读的结果，直接作为阶段提示
          lastMsg.stepLabel = evidence.summary;
          if (evidence.kind !== "resume_change" || evidence.status === "failed" || evidence.changed === false) return;
          // 运行时确认真实写入后开放撤回，并留下本轮改动说明
          writeMessages.add(lastMsg);
          lastMsg.hasWriteChanges = true;
          lastMsg.writeSummary = evidence.summary;
        },
        onTrace: (event) => {
          if (!isCurrentRequest() || !lastMsg?.agentRun) return;
          if (event.type === "planned") {
            lastMsg.agentRun.task = event.task;
            return;
          }
          if (event.type === "implicit") {
            // 降级建任务必须留下说明，否则验收口径为何放宽无法解释
            lastMsg.agentRun.task = event.task;
            lastMsg.agentRun.note = `未建立任务契约，已按 ${event.tool} 的效果降级处理`;
            return;
          }
          lastMsg.agentRun.verdicts.push({
            completed: event.completed,
            reason: event.reason,
            at: Date.now(),
          });
        },
        reactConfig: {
          // 单次请求的最大 ReAct 轮次上限
          maxSteps: 99,
          // 超出输入预算时压缩较早的历史，避免长对话溢出与指令失效
          context: resumeContextCompaction,
          reflection: true,
          reflectPrompt,
          onToolError,
          onFinalRetry: () => {
            if (!isCurrentRequest() || !lastMsg) return;
            stepContent = "";
            lastMsg.content = "";
            lastMsg.stepLabel = "正在核对任务完成状态…";
          },
          onReflectStart: () => {
            if (!isCurrentRequest() || !lastMsg) return;
            // 最终精炼轮开始：本轮 content 直接实时渲染为正文
            stepContent = "";
            streamFinalContent = true;
            lastMsg.stepLabel = "正在审视并生成最终回复…";
          },
          thinking: {
            type: thinkMode.value ? "enabled" : "disabled",
          },
          onReasoning: () => state?.onReasoning(),
          onContent: (data) => state?.onContent(data),
          onToken: (totalTokens) => state?.onToken(totalTokens),
          onThink: (reasoning) => {
            if (!isCurrentRequest() || !lastMsg || !reasoning) return;
            lastMsg.stepLabel = "正在深度思考…";
            lastMsg.thought += `\n\n### 思考\n${reasoning}`;
            scrollToBottom();
          },
          onAct: (toolCall) => {
            if (!isCurrentRequest() || !lastMsg) return;
            const displayName = TOOL_NAMES[toolCall.function.name] || toolCall.function.name;
            // 工具开始只记录执行动作，不写入参数与数据
            stepContent = "";
            streamFinalContent = false;
            lastMsg.thought += `\n\n正在${displayName}…\n`;
            lastMsg.stepLabel = `正在${displayName}…`;
            scrollToBottom();
          },
          onObserve: (_observation, round) => {
            if (!isCurrentRequest() || !lastMsg) return;
            // 阶段提示由结构化证据给出，观测只补轮次记录，避免覆盖写入结果
            lastMsg.thought += `\n第 ${round} 轮观测完成`;
            scrollToBottom();
          },
          onReflect: () => {
            if (!isCurrentRequest() || !lastMsg) return;
            lastMsg.stepLabel = "正在输出最终答案…";
            scrollToBottom();
          },
        },
        onFinal: (answer, task) => {
          if (!isCurrentRequest() || !lastMsg) return;
          // ReAct 自行依据任务理解与工具结果收口，写入记录只供撤回使用。
          lastMsg.content = answer;
          lastMsg.resumeTask = task;
          lastMsg.requestStatus = "success";
          lastMsg.stepLabel = "";
          lastMsg.thoughtCollapsed = true;
          stepContent = "";
          streamFinalContent = false;
          scrollToBottom();
          setTimeout(() => {
            if (isCurrentRequest()) scrollToBottom();
          }, 10);
        },
      });
      // 会话内部注入任务上下文并执行完整工具循环。
      await agentSession.run(messages);
    } catch (error: any) {
      stepContent = "";
      streamFinalContent = false;
      // 若已卸载则忽略
      if (!isCurrentRequest()) return;
      // 主动中止不视为错误
      if (isAbortError(error)) return;
      console.error("AI 请求异常:", error);
      if (lastMsg) {
        lastMsg.content = describeResumeAiError(error);
        lastMsg.typing = false;
        lastMsg.requestStatus = "error";
        lastMsg.stepLabel = "";
      }
    } finally {
      // 清理工作（无论成功或失败）
      // 请求结束还原调用方现场
      const isCurrent = isCurrentRequest();
      afterRequest?.(requestTaskId);
      state?.dispose();
      if (isCurrent) {
        const finishTime = Date.now();
        // 仅当前任务可以收口生成状态，避免旧任务覆盖新任务
        generating.value = false;
        // 观测：收口时补齐耗时、用量与最终任务快照
        if (lastMsg?.agentRun) {
          lastMsg.agentRun.durationMs = finishTime - lastMsg.agentRun.startedAt;
          lastMsg.agentRun.tokens = lastMsg.total_tokens;
          lastMsg.agentRun.task = agentSession?.getTask() ?? lastMsg.agentRun.task;
        }
        abortRequest = null;
        agentSession = null;
        if (lastMsg?.typing) lastMsg.typing = false;
        if (chat.value) chat.value.updateTime = finishTime;
        // 按钮等尾部内容在 typing=false 后才渲染，收尾后补一次滚动避免被遮挡
        if (!isUnmounted) {
          await scrollToBottom();
        }
      }
    }
  };

  /**
   * 停止当前 AI 请求
   */
  const stopGenerating = () => {
    requestVersion += 1;
    abortRequest?.(); // 取消请求
    abortRequest = null;
    agentSession?.abort();
    agentSession = null;
    // 停止请求时同步停止耗时计数
    if (activeTimers) {
      clearTimers(activeTimers);
      activeTimers = null;
    }
    // 将所有消息的打字状态置为false
    currentMessages.value.forEach((message) => {
      if (message.typing) {
        message.typing = false;
        // 用户主动停止不是失败：保留已生成内容与撤回入口，只标记为已停止
        message.requestStatus = "stopped";
        message.stepLabel = "";
        // 已输出正文时补一句停止说明，避免用户误以为回答没写完
        message.content = message.content?.trim()
          ? `${message.content}\n\n（以上为已生成的内容，已停止继续输出。）`
          : "已停止生成，可以重新发起或补充要求后继续。";
      }
    });
    generating.value = false;
  };

  // 组件卸载时取消请求，避免旧请求继续更新
  onUnmounted(() => {
    isUnmounted = true;
    requestVersion += 1; // 使所有旧请求失效
    abortRequest?.();
    abortRequest = null;
    agentSession?.abort();
    agentSession = null;
    if (activeTimers) {
      clearTimers(activeTimers);
      activeTimers = null;
    }
    generating.value = false;
    currentMessages.value.forEach((message) => {
      if (message.typing) message.typing = false;
    });
  });

  // 返回发送和停止方法
  // 撤回本轮 AI 修改：恢复请求前备份
  function withdrawAI(msg?: Message | null) {
    if (!msg) return false;
    const backup = requestBackups.get(msg);
    if (backup === undefined) return false;
    if (!writeMessages.has(msg) || !restoreBackup(backup)) return false;
    requestBackups.delete(msg);
    writeMessages.delete(msg);
    msg.hasWriteChanges = false;
    // 撤回后本轮改动已回滚，改动说明不能再保留
    msg.writeSummary = undefined;
    return true;
  }

  // 该条 AI 回复是否真实产生过简历写入
  // 备份仅存在于当前组件内存，历史会话不得显示无法执行的撤回入口
  function hasWriteChanges(msg?: Message | null) {
    return !!msg?.hasWriteChanges && requestBackups.has(msg) && writeMessages.has(msg);
  }

  return { handleAIResponse, stopGenerating, withdrawAI, hasWriteChanges };
};
