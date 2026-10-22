// 导入LLM接口
import { AbortError, isAbortError } from "@/apis";
import {
  createResumeAiReactRunner,
  isPersistentTaskSkillId,
  understandAssistantTask,
  type Skill,
} from "@snowflake/resume-agent";
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
// 专用一键技能仅向对应按钮任务开放，普通聊天由任务理解选择通用技能。
const ONE_KEY_SKILLS = new Set(["resume_one_key_optimize", "resume_one_key_adjust"]);
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
  // 最近一次执行的工具名：用于判断观察结果是否为技能加载，避免把技能全文存入思考区
  let lastToolName = "";
  // 用于取消当前请求的函数引用
  let abortRequest: (() => void) | null = null;
  // ReAct 编排器引用，用于中止循环
  let reactRunner: { abort: () => void; run: (messages: any[]) => Promise<string> } | null = null;
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
  const TOOL_NAMES: Record<string, string> = {
    read_resume_data: "读取简历数据",
    propose_resume_edits: "修改简历数据",
    resume_data_contract: "读取《简历数据规范》",
    resume_writing: "读取《简历编写》",
    resume_optimization: "读取《简历写作方法论》",
    job_match: "读取《岗位匹配与 ATS 优化》",
    resume_translate: "读取《简历翻译》",
    self_intro: "读取《面试自我介绍》",
    greeting: "读取《打招呼语》",
    interview_prediction: "读取《面试押题》",
    specialized_interview: "读取《专项面试模拟》",
    aptitude_hr_interview: "读取《行测与 HR 面试》",
    resume_create: "读取《从零生成简历经历》",
    resume_interview: "读取《AI 简历面试》",
    resume_score: "读取《AI 简历评估》",
    resume_one_key_adjust: "读取《一键调整》",
    resume_one_key_optimize: "读取《一键优化》",
    update_resume_language: "更新简历语言",
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
    lastToolName = "";
    // 辅助函数：检查当前请求是否仍为最新且组件未卸载
    const isCurrentRequest = () =>
      !isUnmounted &&
      currentRequestVersion === requestVersion &&
      resumeStore.currentItem?.id === requestResumeId &&
      chat.value?.id === requestChatId;
    // 前置任务理解与 ReAct 共用当前请求的取消入口。
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
      // 历史任务技能只用于理解续轮，本轮实际技能由任务理解重新选择。
      const activeTaskSkillMessage = [...currentMessages.value]
        .reverse()
        .find((message) => isPersistentTaskSkillId(message.systemSkillId));
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
          role: message.role,
          content: message.content,
        }));
      // 动态提级默认提示词：先移除所有已存在的默认提示，再插入到最后一个用户消息之前
      // 确保每次请求规则都紧邻用户问题，避免长对话遗忘导致幻觉
      // 找到最后一个用户消息位置
      const lastUserIndex = messages.map((message) => message.role).lastIndexOf("user");
      if (lastUserIndex !== -1) {
        // 默认规则紧邻本轮请求，任务理解在后续作为独立上下文补入。
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
      // 请求开始即启动计时，避免首个模型事件返回前没有耗时
      state.onReasoning();

      // 首次请求时才加载技能与简历工具清单。
      const clearTaskSkill = () => {
        for (let index = currentMessages.value.length - 1; index >= 0; index -= 1) {
          if (isPersistentTaskSkillId(currentMessages.value[index]?.systemSkillId)) {
            currentMessages.value.splice(index, 1);
          }
        }
      };
      const activateTaskSkill = (skill: Skill) => {
        // 规范、行业与写入方法只在当轮使用，只有任务技能跨轮保留。
        if (!isPersistentTaskSkillId(skill.id)) return;
        const activeTaskSkill = [...currentMessages.value]
          .reverse()
          .find((message) => isPersistentTaskSkillId(message.systemSkillId));
        if (activeTaskSkill?.systemSkillId === skill.id) return;
        // 切换任务时移除旧任务技能，确保会话中始终只有一个当前任务。
        clearTaskSkill();
        addMessage({
          role: "system",
          content: `# 当前任务技能：${skill.name}\n\n${skill.instructions}`,
          systemSkillId: skill.id,
          typing: false,
        });
      };
      const { tools: resolvedTools, skills } = await resolveTools(activateTaskSkill);
      // 加载期间取消或切换会话时不再启动请求，工具执行前再次核对所属任务
      if (!isCurrentRequest()) return;
      const entrySkillId = entryFlow === "oneKeyOptimize"
        ? "resume_one_key_optimize"
        : entryFlow === "oneKeyAdjust"
          ? "resume_one_key_adjust"
          : null;
      // 每轮根据用户原话、近期上下文和入口来源理解任务，避免用动词表决定是否写入。
      let taskUnderstanding: Awaited<ReturnType<typeof understandAssistantTask>> = null;
      try {
        taskUnderstanding = await understandAssistantTask({
          messages: messages
            .filter((message) => (message.role === "user" || message.role === "assistant") && !!message.content)
            .slice(-8)
            .map((message) => ({ role: message.role as "user" | "assistant", content: message.content.slice(0, 1500) })),
          entryFlow: typeof entryFlow === "string" ? entryFlow : undefined,
          previousSkillId: activeTaskSkillMessage?.systemSkillId,
          skills: skills.filter((skill) => (isPersistentTaskSkillId(skill.id) || skill.id === "resume_writing") &&
            (!ONE_KEY_SKILLS.has(skill.id) || skill.id === entrySkillId))
            .map(({ id, name, description }) => ({ id, name, description })),
        }, taskAbortController.signal, addTokenUsage);
      } catch (error) {
        if (isAbortError(error)) throw error;
        console.warn("[任务理解] 前置分析失败，交由 ReAct 根据原始请求判断:", error);
      }
      if (!isCurrentRequest()) return;
      // 手动一键入口直接带入专用任务技能；聊天请求使用前置理解的技能建议。
      const taskSkill = skills.find((skill) => skill.id === (entrySkillId ?? taskUnderstanding?.skillId));
      // 新任务未选中可延续的技能时，清除旧任务记忆，避免下轮误承接。
      if (taskUnderstanding && !isPersistentTaskSkillId(taskSkill?.id)) clearTaskSkill();
      if (taskSkill) activateTaskSkill(taskSkill);
      const taskContext = [
        ...(taskUnderstanding ? [{ role: "system" as const, content: `# 本轮候选任务理解\n目标：${taskUnderstanding.objective}\n执行方向：${taskUnderstanding.approach}\n若与用户原话冲突，以用户原话为准；工具调用自行决定。` }] : []),
        ...(taskSkill ? [{ role: "system" as const, content: `# 当前任务技能：${taskSkill.name}\n\n${taskSkill.instructions}` }] : []),
      ];
      const requestIndex = messages.map((message) => message.role).lastIndexOf("user");
      if (requestIndex !== -1) messages.splice(requestIndex, 0, ...taskContext);
      const tools = resolvedTools.filter((tool) => !ONE_KEY_SKILLS.has(tool.name) || tool.name === entrySkillId).map((tool) => ({
        ...tool,
        // 失效请求不得读取或修改当前简历
        execute: (args: any) => {
          if (!isCurrentRequest()) throw new AbortError();
          return tool.execute(args);
        },
      }));
      // 所有请求统一走 React 编排，当前任务技能可由会话系统消息跨轮提供。
      reactRunner = createResumeAiReactRunner("xiaoZhou", {
        tools,
        // 单次请求的最大 ReAct 轮次上限
        maxSteps: 99,
        reflection: true,
        reflectPrompt,
        onToolError,
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
          lastToolName = toolCall.function.name;
          const displayName = TOOL_NAMES[toolCall.function.name] || toolCall.function.name;
          // 工具开始只记录执行动作，不写入参数与数据
          stepContent = "";
          streamFinalContent = false;
          lastMsg.thought += `\n\n正在执行：${displayName}\n`;
          lastMsg.stepLabel = `正在执行：${displayName}`;
          scrollToBottom();
        },
        onObserve: (observation, round) => {
          if (!isCurrentRequest() || !lastMsg) return;
          // 只有工具确认实际写入后才开放撤回，校验失败不算修改
          if (lastToolName === "propose_resume_edits") {
            try {
              const result = JSON.parse(observation.content);
              // 打印每次写入的结果与剩余问题：ReAct 观察日志有长度截断，剩余问题在末尾会被裁掉
              console.log(`[一键调整] 第 ${round} 轮写入结果:`, {
                applied: result?.applied,
                changed: result?.changed?.length ?? 0,
                errors: result?.errors,
                remainingIssues: result?.remainingIssues,
              });
              if (result.applied && result.changed?.length) {
                writeMessages.add(lastMsg);
                lastMsg.hasWriteChanges = true;
              }
            } catch (error) {
              // 解析失败时打印原始观察结果，避免静默吞掉导致验收误判无法排查
              console.warn("[一键调整] 写入观察结果解析失败:", observation.content, error);
            }
          }
          const displayName = TOOL_NAMES[lastToolName] || lastToolName;
          // 工具完成时标注当前 ReAct 轮次，观察数据不写入思考区
          lastMsg.thought += `\n第 ${round} 轮观测完成：${displayName}`;
          lastMsg.stepLabel = `第 ${round} 轮观测完成，正在处理结果…`;
          scrollToBottom();
        },
        onReflect: () => {
          if (!isCurrentRequest() || !lastMsg) return;
          lastMsg.stepLabel = "正在输出最终答案…";
          scrollToBottom();
        },
        onFinal: (answer) => {
          if (!isCurrentRequest() || !lastMsg) return;
          // ReAct 自行依据任务理解与工具结果收口，写入记录只供撤回使用。
          lastMsg.content = answer;
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
      // 执行工具循环
      await reactRunner.run(messages);
    } catch (error: any) {
      stepContent = "";
      streamFinalContent = false;
      // 若已卸载则忽略
      if (!isCurrentRequest()) return;
      // 主动中止不视为错误
      if (isAbortError(error)) return;
      console.error("AI 请求异常:", error);
      if (lastMsg) {
        lastMsg.content = `请求出错: ${error.message || "未知错误"}`;
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
        abortRequest = null;
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
    reactRunner?.abort();
    reactRunner = null;
    // 停止请求时同步停止耗时计数
    if (activeTimers) {
      clearTimers(activeTimers);
      activeTimers = null;
    }
    // 将所有消息的打字状态置为false
    currentMessages.value.forEach((message) => {
      if (message.typing) {
        message.typing = false;
        // 中止后保留实际写入的撤回入口，空回复可重新发起
        message.requestStatus = message.hasWriteChanges ? "success" : "error";
        message.stepLabel = "";
        message.content ||= "已停止生成";
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
    reactRunner?.abort();
    reactRunner = null;
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
    return true;
  }

  // 该条 AI 回复是否真实产生过简历写入
  // 备份仅存在于当前组件内存，历史会话不得显示无法执行的撤回入口
  function hasWriteChanges(msg?: Message | null) {
    return !!msg?.hasWriteChanges && requestBackups.has(msg) && writeMessages.has(msg);
  }

  return { handleAIResponse, stopGenerating, withdrawAI, hasWriteChanges };
};
