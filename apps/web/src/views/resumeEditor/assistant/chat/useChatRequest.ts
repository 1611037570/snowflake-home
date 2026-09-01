// 导入LLM接口
import { getLLM } from "@/apis";
import { useAiStore, useResumeStore } from "@/stores";
// 导入聊天和消息类型
import type { Chat, Message } from "@/stores/modules/ai";
// 导入Vue组合式API相关类型
import { onUnmounted, type ComputedRef, type Ref } from "vue";
import { storeToRefs } from "pinia";
// 导入工具函数：用户数据和字段分析
import { fieldAnalysis, userData } from "./utils";

// 定义 useChatRequest 的配置选项接口
interface UseChatRequestOptions {
  chat: Ref<Chat>; // 当前聊天会话
  currentMessages: ComputedRef<Message[]>; // 当前消息列表（只读）
  addMessage: (message: Partial<Message>) => void; // 添加消息的方法
  scrollToBottom: () => void | Promise<void>; // 滚动到底部
  applyDiff?: (data: Record<string, any>) => void; // 应用数据差异（可选）
  onRequestComplete: (message: Message | null) => void; // 请求完成回调
}

// 主组合式函数：处理AI聊天请求
export const useChatRequest = ({
  chat,
  currentMessages,
  addMessage,
  scrollToBottom,
  applyDiff,
  onRequestComplete,
}: UseChatRequestOptions) => {
  const resumeStore = useResumeStore();
  const aiStore = useAiStore();
  const { isGenerating } = storeToRefs(resumeStore);
  const { thinkMode, activeModel, customModel } = storeToRefs(aiStore);
  // 用于取消当前请求的函数引用
  let abortRequest: (() => void) | null = null;
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

  /**
   * 发送 AI 请求并记录思考与回复耗时
   */
  const handleAIResponse = async () => {
    // 增加请求版本，用于判断当前请求是否有效
    const currentRequestVersion = ++requestVersion;
    // 辅助函数：检查当前请求是否仍为最新且组件未卸载
    const isCurrentRequest = () => !isUnmounted && currentRequestVersion === requestVersion;
    // 初始化本次请求的耗时计数
    const timers: ChatTimers = { thinking: null, reply: null };
    activeTimers = timers;
    // 设置生成状态为true
    isGenerating.value = true;
    // 选中整个模块或 user 模块时，临时清除头像避免请求体过大，请求结束还原
    const { selectedModule, currentData } = resumeStore;
    const needTrimAvatar =
      !selectedModule.length || selectedModule.some((item: any) => item.key === "user");
    let savedAvatar: string | undefined;
    if (needTrimAvatar && currentData.user) {
      savedAvatar = currentData.user.avatar;
      delete currentData.user.avatar;
    }
    // 最后一条消息（即AI回复消息）的引用
    let lastMsg: Message | null = null;

    try {
      // 构建消息列表（只复制role和content）
      const messages = currentMessages.value.map((message) => ({
        role: message.role,
        content: message.content,
      }));
      const lastInput = messages.at(-1);
      if (!lastInput) return;
      // 拼接用户数据和字段分析到最后一条用户消息内容中
      const content = `
    ${userData.value}

    ${fieldAnalysis.value}

    ${lastInput.content}

    `;
      lastInput.content = content;

      // 添加一条空的AI回复消息（打字状态）
      addMessage({
        role: "assistant",
        content: "",
        typing: true,
      });
      // 获取刚添加的AI消息引用
      lastMsg = currentMessages.value[currentMessages.value.length - 1] ?? null;

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
        // 如果是自定义模型，添加model字段
        ...(activeModel.value === "custom" ? { model: customModel.value?.model } : {}),
      };

      // 发起请求，获取发送函数和取消函数
      const { sendFn, abortFn } = await llm.request({
        options,
        debug: false,
        stream: true, // 流式输出
        isJson: true,
        // 事件回调：处理流式数据
        onEvent: (type, data) => {
          if (!isCurrentRequest() || !lastMsg) return;
          if (type === "reasoning") {
            // 思考内容追加
            lastMsg.requestStatus = "thinking";
            if (!timers.thinking) {
              timers.thinking = setInterval(() => {
                if (isCurrentRequest()) lastMsg!.thoughtTime += 1;
              }, 1000);
            }
            lastMsg.thought += data;
          } else if (type === "content") {
            // 首次收到正文后切换到回复计时
            lastMsg.requestStatus = "generating";
            if (!timers.reply) {
              if (timers.thinking) clearInterval(timers.thinking);
              timers.thinking = null;
              timers.reply = setInterval(() => {
                if (isCurrentRequest()) lastMsg!.contentTime += 1;
              }, 1000);
            }
            // 首次收到内容时折叠思考区域
            if (!lastMsg.thoughtCollapsed && !thoughtStatus) {
              thoughtStatus = true;
              lastMsg.thoughtCollapsed = true;
            }
            lastMsg.content += data;
          } else if (type === "total_tokens") {
            // 记录总token数
            lastMsg.total_tokens = data;
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
          applyDiff?.(res.result.data); // 应用差异数据（如有）
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
      // 请求结束还原头像
      if (needTrimAvatar && currentData.user) {
        currentData.user.avatar = savedAvatar;
      }
      if (isUnmounted) return;
      const finishTime = Date.now();
      clearTimers(timers);
      if (activeTimers === timers) activeTimers = null;
      // 重置状态
      isGenerating.value = false;
      abortRequest = null;
      if (lastMsg?.typing) lastMsg.typing = false;
      if (chat.value) chat.value.updateTime = finishTime;
      // 调用完成回调
      onRequestComplete(lastMsg);
    }
  };

  /**
   * 停止当前 AI 请求
   */
  const stopGenerating = () => {
    abortRequest?.(); // 取消请求
    abortRequest = null;
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
    if (activeTimers) {
      clearTimers(activeTimers);
      activeTimers = null;
    }
    isGenerating.value = false;
    currentMessages.value.forEach((message) => {
      if (message.typing) message.typing = false;
    });
  });

  // 返回发送和停止方法
  return { handleAIResponse, stopGenerating };
};
