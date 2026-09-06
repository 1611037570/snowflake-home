// 导入LLM接口
import { getLLM, isAbortError } from "@/apis";
import { useAiStore, useResumeStore } from "@/stores";
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
  const resumeStore = useResumeStore();
  const { thinkMode } = storeToRefs(aiStore);
  const {
    generating,
    beforeRequest,
    afterRequest,
    tools,
    commitDeferredWrites,
    discardDeferredWrites,
  } = config;
  // 深拷贝简历数据时跳过 base64 大字段（user.avatar、image[].img），避免每请求全量序列化
  const cloneDataSkippingMedia = (value: any, parentKey?: string): any => {
    if (Array.isArray(value)) {
      return value.map((item: any) => cloneDataSkippingMedia(item, parentKey));
    }
    if (value && typeof value === "object") {
      const result: Record<string, any> = {};
      Object.entries(value).forEach(([key, item]) => {
        if (parentKey === "user" && key === "avatar") return;
        if (parentKey === "image" && key === "img") return;
        const nextParent = key === "user" || key === "image" ? key : parentKey;
        result[key] = cloneDataSkippingMedia(item, nextParent);
      });
      return result;
    }
    return value;
  };
  // 请求前备份简历数据，撤回修改时恢复（仅当前会话内存使用）
  const captureBackup = () => {
    const item = resumeStore.currentItem;
    if (!item) return null;
    return {
      data: cloneDataSkippingMedia(item.data ?? {}),
      config: JSON.parse(JSON.stringify(item.config ?? {})),
      fixedConfig: JSON.parse(JSON.stringify(item.fixedConfig ?? {})),
    };
  };
  const restoreBackup = (backup: any) => {
    const item = resumeStore.currentItem;
    if (!item || !backup) return;
    // 恢复时保留当前未被 AI 修改的大字段（头像、作品图）
    const currentData = item.data || {};
    const avatar = currentData?.user?.data?.avatar;
    const imageItems = Array.isArray(currentData?.image?.data) ? currentData.image.data : [];
    item.data = backup.data ?? {};
    if (backup.data?.user?.data && avatar !== undefined) {
      item.data.user.data.avatar = avatar;
    }
    if (Array.isArray(item.data?.image?.data)) {
      item.data.image.data.forEach((record: any, index: number) => {
        if (record && imageItems[index]) record.img = imageItems[index].img;
      });
    }
    item.config = backup.config ?? {};
    item.fixedConfig = backup.fixedConfig ?? {};
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
    propose_resume_edits: "提交修改",
    load_resume_data_contract: "读取《简历数据规范》",
    load_resume_writing: "读取《简历编写》",
    load_resume_optimization: "读取写作方法论",
    load_job_match: "读取岗位匹配规范",
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
    // 请求前备份简历，撤回修改时恢复
    const backup = captureBackup?.();
    stepContent = "";
    streamFinalContent = false;
    finalContentStarted = false;
    lastToolName = "";
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
      if (lastMsg && backup != null) requestBackups.set(lastMsg, backup);
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
        reflection: true,
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
          lastToolName = toolCall.function.name;
          const displayName = TOOL_NAMES[toolCall.function.name] || toolCall.function.name;
          // 工具开始只记录执行动作，不写入参数与数据
          stepContent = "";
          streamFinalContent = false;
          lastMsg.thought += `\n\n正在执行：${displayName}\n`;
          lastMsg.stepLabel = `正在执行：${displayName}`;
          scrollToBottom();
        },
        onObserve: () => {
          if (!isCurrentRequest() || !lastMsg) return;
          const displayName = TOOL_NAMES[lastToolName] || lastToolName;
          // 工具完成只记录完成动作，观察数据不写入思考区
          lastMsg.thought += `\n执行完成：${displayName}`;
          lastMsg.stepLabel = "正在处理结果…";
          scrollToBottom();
        },
        onReflect: () => {
          if (!isCurrentRequest() || !lastMsg) return;
          lastMsg.stepLabel = "正在输出最终答案…";
          scrollToBottom();
        },
        onFinal: (answer) => {
          if (!isCurrentRequest() || !lastMsg) return;
          lastMsg.content = answer;
          lastMsg.requestStatus = "success";
          lastMsg.stepLabel = "";
          lastMsg.thoughtCollapsed = true;
          stepContent = "";
          streamFinalContent = false;
          // 回复完成后再统一提交生成期间缓冲的写操作；有真实写入才开放“撤回修改”
          const hadWrites = commitDeferredWrites?.() ?? false;
          if (hadWrites && lastMsg) writeMessages.add(lastMsg);
          scrollToBottom();
        },
      });
      // 执行工具循环
      await reactRunner.run(messages);
    } catch (error: any) {
      stepContent = "";
      streamFinalContent = false;
      // 取消或失败时丢弃缓冲写操作，避免留下半截新增/修改
      discardDeferredWrites?.();
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
  // 撤回本轮 AI 修改：恢复请求前备份
  function withdrawAI(msg?: Message | null) {
    if (!msg) return false;
    const backup = requestBackups.get(msg);
    if (backup === undefined) return false;
    requestBackups.delete(msg);
    restoreBackup?.(backup);
    return true;
  }

  // 该条 AI 回复是否真实产生过简历写入
  function hasWriteChanges(msg?: Message | null) {
    return !!msg && writeMessages.has(msg);
  }

  return { handleAIResponse, stopGenerating, withdrawAI, hasWriteChanges };
};
