<script setup>
import { useAiStore } from "@/stores";
import { useScroll } from "@vueuse/core";
import { computed, nextTick, ref, watch } from "vue";

import ChatInput from "./chatInput.vue";
import MessageList from "./messageList.vue";
import WelcomeScreen from "./welcomeScreen.vue";
const { type } = defineProps({
  type: {
    type: String,
    default: "default",
  },
});
provide("type", type);
const { createDefaultMessage } = useAiStore();
const chat = defineModel("chat", {
  required: true,
});
provide("chat", chat);
// 请求完成事件，转发给父组件
const emit = defineEmits(["requestComplete"]);

// currentMessages：从 chat.messages 派生，支持写入（写回 chat.messages）
const currentMessages = computed({
  get: () => chat.value?.messages ?? [],
  set: (val) => {
    if (chat.value) chat.value.messages = val;
  },
});
provide("chat", chat);
provide("currentMessages", currentMessages);
/**
 * 向当前对话追加一条消息
 */
function addMessage(msg) {
  chat.value.messages.push({
    ...createDefaultMessage(),
    ...msg,
  });
  chat.value.updateTime = Date.now();
}
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

/**
 * 滚动到底部
 */
const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value?.wrapRef) {
    chatContainer.value.setScrollTop(chatContainer.value.wrapRef.scrollHeight);
  }
};
provide("scrollToBottom", scrollToBottom);

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
 * 点击推荐问题，触发输入框发送
 */
const handleSendFollowQuestion = (question) => {
  chatInputRef.value?.sendQuestion(question);
};

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
 * 撤回消息并重新编辑
 */
// const handleRecall = (msg) => {
//   const index = currentMessages.value.indexOf(msg);
//   if (index === -1) return;

//   ElMessageBox.confirm("确定要撤回这条消息并重新编辑吗？其后的对话也将被清除。", "撤回消息", {
//     confirmButtonText: "确定",
//     cancelButtonText: "取消",
//     type: "warning",
//   })
//     .then(() => {
//       // 停止生成并重置状态
//       stopGenerating();

//       const recalledMsg = currentMessages.value[index];
//       // 撤回该条消息及其后面的所有消息
//       currentMessages.value = currentMessages.value.slice(0, index);

//       if (currentChat.value) {
//         currentChat.value.updateTime = Date.now();
//       }

//       if (recalledMsg?.role === "user") {
//         inputMessage.value = recalledMsg.content;
//       }

//       nextTick(() => chatInputRef.value?.focus());
//     })
//     .catch(() => {});
// };
</script>

<template>
  <div class="relative flex h-full w-full flex-col select-text">
    <SfScrollbar ref="chatContainer" class="h-full w-full flex-1">
      <slot name="empty" v-if="currentMessages.length === 1">
        <WelcomeScreen @suggest="handleSuggest" />
      </slot>

      <MessageList
        v-if="currentMessages.length > 1"
        :messages="currentMessages"
        @recall="handleRecall"
        @sendFollowQuestion="handleSendFollowQuestion"
      />
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

    <ChatInput ref="chatInputRef" @request-complete="emit('requestComplete', $event)" />
  </div>
</template>

<style scoped></style>
