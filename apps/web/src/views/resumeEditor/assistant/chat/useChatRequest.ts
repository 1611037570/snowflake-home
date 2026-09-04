// 导入LLM接口
import { getLLM, isAbortError } from "@/apis";
import { useAiStore } from "@/stores";
// 导入聊天和消息类型
import type { Chat, Message } from "@/stores/modules/ai";
// 导入Vue组合式API相关类型
import { onUnmounted, type ComputedRef, type Ref } from "vue";
import { storeToRefs } from "pinia";
// 宿主传入的请求配置：技能与工具由调用方组装，chat 不内置业务内容
import type { AssistantConfig } from "../types";

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
  const { thinkMode } = storeToRefs(aiStore);
  const {
    generating,
    beforeRequest,
    afterRequest,
    buildUserContent,
    skills,
    reactSystem,
    tools,
    applyResult,
  } = config;
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

  // 统一状态处理器：把 reasoning/content/total_tokens 映射为请求状态与耗时计数
  const createChatState = (lastMsg: Message | null, isCurrent: () => boolean) => {
    const timers: ChatTimers = { thinking: null, reply: null };
    activeTimers = timers;

    const onEvent = (type: string, data: any) => {
      if (!isCurrent() || !lastMsg) return;
      if (type === "reasoning") {
        lastMsg.requestStatus = "thinking";
        if (!timers.thinking) {
          timers.thinking = setInterval(() => {
            if (isCurrent()) lastMsg.thoughtTime += 1;
          }, 1000);
        }
      } else if (type === "content") {
        lastMsg.requestStatus = "generating";
        if (!timers.reply) {
          if (timers.thinking) clearInterval(timers.thinking);
          timers.thinking = null;
          timers.reply = setInterval(() => {
            if (isCurrent()) lastMsg.contentTime += 1;
          }, 1000);
        }
      } else if (type === "total_tokens") {
        lastMsg.total_tokens = data;
      }
    };

    const dispose = () => {
      clearTimers(timers);
      if (activeTimers === timers) activeTimers = null;
    };

    return { onEvent, dispose };
  };

  // 把技能正文合并为一份系统上下文，技能由调用方投递、不写入对话记录
  const getSkillContent = () =>
    skills
      .map((skill) => skill.instructions)
      .filter(Boolean)
      .join("\n\n----\n\n");

  /**
   * 发送 AI 请求并记录思考与回复耗时
   */
  const handleAIResponse = async () => {
    // 增加请求版本，用于判断当前请求是否有效
    const currentRequestVersion = ++requestVersion;
    // 辅助函数：检查当前请求是否仍为最新且组件未卸载
    const isCurrentRequest = () => !isUnmounted && currentRequestVersion === requestVersion;
    // 设置生成状态为true
    generating.value = true;
    // 最后一条消息（即AI回复消息）的引用与状态处理器
    let lastMsg: Message | null = null;
    let state: ReturnType<typeof createChatState> | null = null;

    try {
      // 请求前调用方准备（如临时裁剪头像等大字段）
      beforeRequest?.();
      // 构建消息列表（只复制role和content）
      const messages = currentMessages.value.map((message) => ({
        role: message.role,
        content: message.content,
      }));
      const lastInput = messages.at(-1);
      if (!lastInput) return;
      // 拼接调用方提供的用户上下文（如简历数据与字段解析）
      if (buildUserContent) {
        lastInput.content = buildUserContent(lastInput.content);
      }
      // 投递技能正文作为系统上下文
      const skillContent = getSkillContent();
      if (skillContent) {
        messages.unshift({ role: "system", content: skillContent });
      }

      // 添加一条空的AI回复消息（打字状态）
      addMessage({
        role: "assistant",
        content: "",
        typing: true,
      });
      // 获取刚添加的AI消息引用
      lastMsg = currentMessages.value[currentMessages.value.length - 1] ?? null;
      state = createChatState(lastMsg, isCurrentRequest);

      // 测试开关：配置 VITE_MOCK_AI=true 时拦截真实请求，返回模拟数据
      if (import.meta.env.VITE_MOCK_AI === "true") {
        const mockContent = JSON.stringify({
          data: null,
          analysis: "## 模拟回复\n\n这是一条测试数据，未调用真实 AI 接口。",
          followQuestions: ["再来一次", "帮我优化一下"],
        });
        await new Promise((resolve) => {
          let index = 0;
          const timer = setInterval(() => {
            if (!isCurrentRequest() || !lastMsg) {
              clearInterval(timer);
              resolve();
              return;
            }
            lastMsg.requestStatus = "generating";
            lastMsg.content += mockContent[index++];
            scrollToBottom();
            if (index >= mockContent.length) {
              clearInterval(timer);
              lastMsg.requestStatus = "success";
              scrollToBottom();
              resolve();
            }
          }, 12);
        });
        return;
      }

      // 思考状态标记（用于折叠）
      let thoughtStatus = false;
      // 获取LLM实例
      const llm = getLLM();
      // 构建请求参数
      const options = {
        // 根据provider决定使用messages还是input字段
        [llm.provider === "openai" ? "messages" : "input"]: messages,
        thinking: {
          type: thinkMode.value ? "enabled" : "disabled",
        },
      };

      // 发起请求，获取发送函数和取消函数
      const { sendFn, abortFn } = await llm.request({
        options,
        isDebug: false,
        isStream: true, // 流式输出
        isJson: true,
        // 事件回调：处理流式数据
        onEvent: (type, data) => {
          state?.onEvent(type, data);
          if (!isCurrentRequest() || !lastMsg) return;
          if (type === "reasoning") {
            // 思考内容追加
            lastMsg.thought += data;
          } else if (type === "content") {
            // 首次收到正文后切换到回复计时
            // 首次收到内容时折叠思考区域
            if (!lastMsg.thoughtCollapsed && !thoughtStatus) {
              thoughtStatus = true;
              lastMsg.thoughtCollapsed = true;
            }
            lastMsg.content += data;
          }
          // 滚动到最新消息
          scrollToBottom();
        },
        // 失败回调
        onFail: (error) => {
          if (!isCurrentRequest() || !lastMsg) return;
          lastMsg.content = `请求出错: ${error.message || "未知错误"}`;
          lastMsg.typing = false;
          lastMsg.requestStatus = "error";
        },
        // 成功回调
        onSuccess: (res) => {
          if (!isCurrentRequest() || !lastMsg) return;
          // 应用差异由调用方注入的回调处理
          applyResult?.(res.result.data);
          lastMsg.requestStatus = "success";
          scrollToBottom();
        },
      });

      // 如果当前请求已失效，取消并返回
      if (!isCurrentRequest()) {
        abortFn?.();
        return;
      }
      // 保存取消函数供外部调用
      abortRequest = abortFn;
      // 执行发送
      await sendFn();
    } catch (error) {
      // 若已卸载则忽略
      if (isUnmounted) return;
      console.error("AI 请求异常:", error);
    } finally {
      // 清理工作（无论成功或失败）
      // 请求结束还原调用方现场
      afterRequest?.();
      if (isUnmounted) return;
      const finishTime = Date.now();
      state?.dispose();
      // 重置状态
      generating.value = false;
      abortRequest = null;
      if (lastMsg?.typing) lastMsg.typing = false;
      if (chat.value) chat.value.updateTime = finishTime;
    }
  };

  /**
   * 发送 ReAct 请求：prompt 为任务说明，userContent 为用户意图
   */
  const handleReactResponse = async ({
    prompt,
    userContent,
  }: {
    prompt?: string;
    userContent: string;
  }) => {
    const currentRequestVersion = ++requestVersion;
    const isCurrent = () => !isUnmounted && currentRequestVersion === requestVersion;
    let lastMsg: Message | null = null;
    let state: ReturnType<typeof createChatState> | null = null;

    try {
      generating.value = true;

      const messages: any[] = [];
      // 技能正文在前约束数据字段，系统提示在后约束任务与输出协议
      const skillContent = getSkillContent();
      if (skillContent) messages.push({ role: "system", content: skillContent });
      messages.push({ role: "system", content: reactSystem });
      if (prompt) messages.push({ role: "user", content: prompt });
      messages.push({ role: "user", content: userContent });

      addMessage({
        role: "assistant",
        content: "",
        typing: true,
        requestStatus: "thinking",
      });
      lastMsg = currentMessages.value[currentMessages.value.length - 1] ?? null;
      state = createChatState(lastMsg, isCurrent);

      const llm = getLLM();
      reactRunner = llm.react({
        tools,
        maxSteps: 6,
        reflection: true,
        onEvent: (type, data) => {
          state?.onEvent(type, data);
        },
        onThink: (reasoning) => {
          if (!isCurrent() || !lastMsg || !reasoning) return;
          lastMsg.thought += `\n\n### 思考\n${reasoning}`;
        },
        onAct: (toolCall) => {
          if (!isCurrent() || !lastMsg) return;
          const args = toolCall.function.arguments || "{}";
          lastMsg.thought += `\n\n### 执行工具\n\`${toolCall.function.name}\`\n\n\`\`\`json\n${args}\n\`\`\``;
          scrollToBottom();
        },
        onObserve: (observation) => {
          if (!isCurrent() || !lastMsg) return;
          const preview =
            observation.content.length > 1200
              ? `${observation.content.slice(0, 1200)}...`
              : observation.content;
          lastMsg.thought += `\n\n### 观察结果\n\`\`\`json\n${preview}\n\`\`\``;
          scrollToBottom();
        },
        onReflect: (answer) => {
          if (!isCurrent() || !lastMsg) return;
          const preview = answer.length > 1200 ? `${answer.slice(0, 1200)}...` : answer;
          lastMsg.thought += `\n\n### 反思修正\n${preview}`;
          scrollToBottom();
        },
        onFinal: (answer) => {
          if (!isCurrent() || !lastMsg) return;
          lastMsg.content = answer;
          lastMsg.requestStatus = "success";
          scrollToBottom();
        },
      });

      await reactRunner.run(messages);
    } catch (error: any) {
      if (isUnmounted) return;
      // 主动中止不视为错误
      if (isAbortError(error)) return;
      console.error("ReAct 请求异常:", error);
      if (lastMsg) {
        lastMsg.content = `请求出错: ${error.message || "未知错误"}`;
        lastMsg.requestStatus = "error";
      }
    } finally {
      reactRunner = null;
      state?.dispose();
      generating.value = false;
      if (lastMsg?.typing) lastMsg.typing = false;
      if (chat.value) chat.value.updateTime = Date.now();
    }
  };

  /**
   * 停止当前 AI 请求
   */
  const stopGenerating = () => {
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
      if (message.typing) message.typing = false;
    });
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
  return { handleAIResponse, handleReactResponse, stopGenerating };
};
