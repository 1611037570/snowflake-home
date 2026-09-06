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
  const { generating, beforeRequest, afterRequest, tools } = config;
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

  // 工具名到用户可读动作的映射，用于等待态展示当前正在做什么
  const TOOL_STEP_LABELS: Record<string, string> = {
    read_resume_data: "正在读取简历数据…",
    propose_resume_edits: "正在校验并提交修改草稿…",
    load_resume_data_contract: "正在读取《简历数据规范》…",
    load_resume_writing: "正在读取《简历编写》流程…",
    load_resume_optimization: "正在读取写作方法论…",
    load_job_match: "正在读取岗位匹配规范…",
  };

  // 统一状态处理器：把 reasoning/content/total_tokens 映射为请求状态与耗时计数
  const createChatState = (lastMsg: Message | null, isCurrent: () => boolean) => {
    const timers: ChatTimers = { thinking: null, reply: null };
    activeTimers = timers;

    const onEvent = (type: string, data: any) => {
      if (!isCurrent() || !lastMsg) return;
      if (type === "reasoning") {
        lastMsg.requestStatus = "thinking";
        lastMsg.stepLabel = "正在深度思考…";
        if (!timers.thinking) {
          timers.thinking = setInterval(() => {
            if (isCurrent()) lastMsg.thoughtTime += 1;
          }, 1000);
        }
      } else if (type === "content") {
        lastMsg.requestStatus = "generating";
        lastMsg.stepLabel = "正在生成回复…";
        // 实时拼接正文分块，让 Markdown 正文边生成边可见
        if (data) lastMsg.content = `${lastMsg.content || ""}${data}`;
        if (!timers.reply) {
          if (timers.thinking) clearInterval(timers.thinking);
          timers.thinking = null;
          timers.reply = setInterval(() => {
            if (isCurrent()) lastMsg.contentTime += 1;
          }, 1000);
        }
        scrollToBottom();
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
      // 构建消息列表（只复制 role 和 content，跳过带上下文标记的引导对话）
      const messages = currentMessages.value
        .filter((message) => !message.skipContext)
        .map((message) => ({
          role: message.role,
          content: message.content,
        }));
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
      state = createChatState(lastMsg, isCurrentRequest);

      // 所有请求统一走 React 编排，技能规范已随对话系统消息提供
      const llm = getLLM();
      // 未配置模型时抛出明确提示，由统一错误处理呈现
      if (!llm) {
        throw new Error("请先配置并选择 AI 模型");
      }
      reactRunner = llm.react({
        tools,
        maxSteps: 6,
        // TODO: 反思轮暂不启用，后续需要结果审视时恢复为 true
        reflection: false,
        thinking: {
          type: thinkMode.value ? "enabled" : "disabled",
        },
        onEvent: (type, data) => {
          state?.onEvent(type, data);
        },
        onThink: (reasoning) => {
          if (!isCurrentRequest() || !lastMsg || !reasoning) return;
          lastMsg.stepLabel = "正在深度思考…";
          lastMsg.thought += `\n\n### 思考\n${reasoning}`;
        },
        onAct: (toolCall) => {
          if (!isCurrentRequest() || !lastMsg) return;
          // 本轮发起工具调用：清掉该轮随流式输出的正文，避免多轮内容混进同一条消息
          lastMsg.content = "";
          lastMsg.stepLabel =
            TOOL_STEP_LABELS[toolCall.function.name] ||
            `正在执行 ${toolCall.function.name}…`;
          const args = toolCall.function.arguments || "{}";
          lastMsg.thought += `\n\n### 执行工具\n\`${toolCall.function.name}\`\n\n\`\`\`json\n${args}\n\`\`\``;
          scrollToBottom();
        },
        onObserve: (observation) => {
          if (!isCurrentRequest() || !lastMsg) return;
          lastMsg.stepLabel = "已获取结果，正在分析…";
          const preview =
            observation.content.length > 1200
              ? `${observation.content.slice(0, 1200)}...`
              : observation.content;
          lastMsg.thought += `\n\n### 观察结果\n\`\`\`json\n${preview}\n\`\`\``;
          scrollToBottom();
        },
        onReflect: (answer) => {
          if (!isCurrentRequest() || !lastMsg) return;
          lastMsg.stepLabel = "正在检查并修正结果…";
          const preview = answer.length > 1200 ? `${answer.slice(0, 1200)}...` : answer;
          lastMsg.thought += `\n\n### 反思修正\n${preview}`;
          scrollToBottom();
        },
        onFinal: (answer) => {
          if (!isCurrentRequest() || !lastMsg) return;
          lastMsg.content = answer;
          lastMsg.requestStatus = "success";
          lastMsg.stepLabel = "";
          lastMsg.thoughtCollapsed = true;
          scrollToBottom();
        },
      });
      // 执行工具循环
      await reactRunner.run(messages);
    } catch (error: any) {
      // 若已卸载则忽略
      if (isUnmounted) return;
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
  return { handleAIResponse, stopGenerating };
};
