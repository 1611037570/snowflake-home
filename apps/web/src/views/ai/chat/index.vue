<script setup>
import { useAiSettings } from "@/hooks";
import { useAiStore } from "@/stores";
import { arkLLM } from "@/apis";
import { useScroll } from "@vueuse/core";
import { computed, nextTick, ref, watch } from "vue";

import ChatInput from "./chatInput.vue";
import MessageList from "./messageList.vue";
import WelcomeScreen from "./welcomeScreen.vue";

const { createChatMessage } = useAiStore();

const chat = defineModel("chat", {
  required: true,
});

// 默认对话记录标题
const DEFAULT_CHAT_TITLE = "新对话";

// currentChat 直接指向传入的 chat 对象
const currentChat = computed(() => chat.value);

// currentMessages：从 chat.messages 派生，支持写入（写回 chat.messages）
const currentMessages = computed({
  get: () => chat.value?.messages ?? [],
  set: (val) => {
    if (chat.value) chat.value.messages = val;
  },
});

/**
 * 向当前对话追加一条消息
 */
function addMessage(msg) {
  chat.value.messages.push({
    ...createChatMessage(),
    ...msg,
  });
  chat.value.updateTime = Date.now();
  updateChatTitle();
}

/**
 * 根据首条用户消息自动更新对话标题
 */

function updateChatTitle() {
  if (!chat.value || chat.value.title !== DEFAULT_CHAT_TITLE) return;

  const firstUserMsg = chat.value.messages.find((m) => m.role === "user");
  if (firstUserMsg) {
    const content = firstUserMsg.content;
    chat.value.title = content.length > 15 ? `${content.slice(0, 15)}...` : content;
  }
}

// 输入框内容
const inputMessage = ref("");
// 聊天容器的引用，用于滚动
const chatContainer = ref(null);

// 滚动监听，用于显示回到底部按钮
const scrollTarget = computed(() => chatContainer.value?.wrapRef);
const { arrivedState } = useScroll(scrollTarget, {
  offset: { bottom: 100 },
});

const showScrollBottom = computed(() => {
  // 如果没有消息或者已经触底，则不显示
  if (currentMessages.value.length === 0 || arrivedState.bottom) return false;
  return true;
});
// ChatInput 组件的引用，用于聚焦
const chatInputRef = ref(null);
// 是否正在发送中
const isSending = ref(false);
// 中止请求的函数
let abortRequest = null;

// 是否正在生成中（包含发送中、打字中或加载中状态）
const isGenerating = computed(() => {
  const lastMsg = currentMessages.value.at(-1);
  return isSending.value || lastMsg?.typing;
});

// 设置数据
const settings = useAiSettings();

/**
 * 滚动到底部
 */
const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value?.wrapRef) {
    chatContainer.value.setScrollTop(chatContainer.value.wrapRef.scrollHeight);
  }
};

// 监听 chat 变化时滚动到底部并聚焦
watch(
  () => chat.value?.id,
  () => {
    scrollToBottom();
    nextTick(() => chatInputRef.value?.focus());
  },
  { immediate: true },
);

/**
 * 点击提示词卡片
 */
const handleSuggest = (payload) => {
  // 使用本地 addMessage，直接写入 defineModel 传入的 chat.messages
  if (payload?.prompt) {
    addMessage({
      role: "system",
      content: payload.prompt,
      typing: false,
    });
  }
  if (payload?.userContent) {
    addMessage({
      role: "user",
      content: payload.userContent,
      typing: false,
    });
  }
  isSending.value = true;
  scrollToBottom();
  handleAIResponse();
};

/**
 * 停止生成
 */
const stopGenerating = () => {
  isSending.value = false;
  if (abortRequest) {
    abortRequest();
    abortRequest = null;
  }
  // 确保所有消息的打字状态都重置
  currentMessages.value.forEach((msg) => {
    if (msg.typing) {
      msg.typing = false;
    }
  });
};

/**
 * 处理 AI 回复的真实请求
 */
const handleAIResponse = async () => {
  // 保存最后一条消息的引用，用于流式更新内容
  let lastMsg = null;
  try {
    // 从当前消息列表中提取 role 和 content，组装成发送给 AI 的请求消息
    const messages = currentMessages.value.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    // 先添加一条空的助手消息，用于展示打字中状态和流式内容
    addMessage({
      role: "assistant",
      content: "",
      typing: true,
    });

    // 获取刚添加的这条助手消息引用
    lastMsg = currentMessages.value[currentMessages.value.length - 1];
    // 思考状态，初始为 false
    let thoughtStatus = false;
    // 调用豆包大模型流式接口
    const { sendFn, abortFn } = await arkLLM.request({
      options: {
        input: messages,
        model: "deepseek-v4-flash-ga-260731",
        thinking: {
          // 根据设置控制深度思考模式
          type: settings.value.thinkMode === "deep" ? "enabled" : "disabled",
        }, // 👈 这个就是【深度思考开关】
      },
      stream: true, // 开启流式响应
      isJson: false,
      // 流式事件回调
      onEvent: (type, data) => {
        if (type === "reasoning") {
          // 追加思考内容并滚动到底部
          lastMsg.thought += data;
          scrollToBottom();
        } else if (type === "content") {
          // 思考展开，并且首次收到回复内容，标记为完成。
          if (!lastMsg.thoughtCollapsed && !thoughtStatus) {
            thoughtStatus = true;
            lastMsg.thoughtCollapsed = true;
          }
          // 回复正文事件：逐字追加内容并滚动到底部
          lastMsg.content += data;
          scrollToBottom();
        } else if (type === "total_tokens") {
          // token 统计事件：保存本次消耗的 token 数
          lastMsg.total_tokens = data;
        }
      },
      // 请求失败回调
      onFail: (error) => {
        lastMsg.content = `请求出错: ${error.message || "未知错误"}`;
        lastMsg.typing = false;
        isSending.value = false;
        lastMsg.requestStatus = "error";
      },
    });

    // 保存中止函数，供外部停止生成时调用
    abortRequest = abortFn;
    // 执行发送请求
    await sendFn();
  } catch (error) {
    // 捕获异常并打印
    console.error("AI 请求异常:", error);
  } finally {
    // 无论成功失败，统一清理状态
    isSending.value = false;
    abortRequest = null;
    // 确保打字状态被关闭
    if (lastMsg?.typing) {
      lastMsg.typing = false;
    }
    // 更新对话的最后修改时间
    if (currentChat.value) {
      currentChat.value.updateTime = Date.now();
    }
  }
};

/**
 * 处理发送消息
 */
const handleSend = async () => {
  const content = inputMessage.value.trim();
  if (!content || isSending.value) return;

  isSending.value = true;
  try {
    addMessage({
      role: "user",
      content,
      typing: false,
    });

    inputMessage.value = "";
    scrollToBottom();
    nextTick(() => chatInputRef.value?.focus());

    // 立即添加一个空的助手消息用于展示 Loading 状态

    scrollToBottom();

    // 触发真实请求
    handleAIResponse();
  } catch {
    isSending.value = false;
  }
};

/**
 * 撤回消息并重新编辑
 */
const handleRecall = (msg) => {
  const index = currentMessages.value.indexOf(msg);
  if (index === -1) return;

  ElMessageBox.confirm("确定要撤回这条消息并重新编辑吗？其后的对话也将被清除。", "撤回消息", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 停止生成并重置状态
      stopGenerating();

      const recalledMsg = currentMessages.value[index];
      // 撤回该条消息及其后面的所有消息
      currentMessages.value = currentMessages.value.slice(0, index);

      if (currentChat.value) {
        currentChat.value.updateTime = Date.now();
      }

      if (recalledMsg?.role === "user") {
        inputMessage.value = recalledMsg.content;
      }

      nextTick(() => chatInputRef.value?.focus());
    })
    .catch(() => {});
};
</script>

<template>
  <div class="relative flex h-full w-full flex-col select-text">
    <SfScrollbar ref="chatContainer" class="h-full w-full flex-1">
      <WelcomeScreen v-if="currentMessages.length === 1" @suggest="handleSuggest" />
      <MessageList v-else :messages="currentMessages" @recall="handleRecall" />
    </SfScrollbar>

    <!-- 滚动到底部按钮 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-4 opacity-0"
    >
      <div v-if="showScrollBottom" class="absolute bottom-42 left-1/2 z-9990 -translate-x-1/2">
        <button
          class="hover:text-primary flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-100 bg-white text-gray-500 shadow-xl transition-all hover:bg-gray-50 active:scale-95"
          title="回到底部"
          @click="scrollToBottom"
        >
          <SfIcon icon="mingcute:arrow-down-line" class="text-xl" />
        </button>
      </div>
    </Transition>

    <ChatInput
      ref="chatInputRef"
      v-model="inputMessage"
      :settings="settings"
      :isGenerating="isGenerating"
      @send="handleSend"
      @stop="stopGenerating"
      @update:thinkMode="(val) => (settings.thinkMode = val)"
    />
  </div>
</template>

<style scoped></style>
