<script setup>
import { useAiStore, useResumeStore } from "@/stores";
import { useScroll } from "@vueuse/core";
import { computed, inject, nextTick, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { getLLM } from "@/apis";

import AiMessage from "./aiMessage.vue";
import ChatInput from "./chatInput.vue";
import UserMessage from "./userMessage.vue";
import WelcomeScreen from "./welcomeScreen.vue";

const resumeStore = useResumeStore();
const aiStore = useAiStore();
const { currentData, isGenerating } = storeToRefs(resumeStore);
const { createDefaultMessage } = aiStore;
const { thinkMode } = storeToRefs(aiStore);
const applyDiff = inject("applyDiff");

const { type } = defineProps({
  type: {
    type: String,
    default: "default",
  },
});
provide("type", type);
const chat = defineModel("chat", {
  required: true,
});
// 请求完成事件，转发给父组件
const emit = defineEmits(["requestComplete"]);

// currentMessages：从 chat.messages 派生
const currentMessages = computed(() => chat.value?.messages ?? []);
// 过滤掉 system 消息后的显示列表
const displayMessages = computed(() => {
  return currentMessages.value.filter((m) => m.role !== "system");
});
// 切换消息折叠状态
function updateCollapsedStatus(index, type) {
  displayMessages.value[index][`${type}Collapsed`] =
    !displayMessages.value[index][`${type}Collapsed`];
}
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

// 监听 chat 变化时滚动到底部并聚焦
watch(
  () => chat.value?.id,
  () => {
    scrollToBottom();
    nextTick(() => chatInputRef.value?.focus());
  },
  { immediate: true },
);

// 是否正在发送中
const isSending = ref(false);
// 中止请求的函数
let abortRequest = null;

/**
 * 处理发送消息
 */
const handleSend = (content) => {
  // 确保输入内容不为空
  if (!content) return;
  // 确保当前没有正在发送的消息
  if (isSending.value) return;
  isSending.value = true;
  addMessage({
    role: "user",
    content,
    typing: false,
  });
  scrollToBottom();
  // 触发真实请求
  handleAIResponse();
};

/**
 * 处理 AI 回复的真实请求
 */
const handleAIResponse = async () => {
  isGenerating.value = true;
  // 保存最后一条消息的引用，用于流式更新内容
  let lastMsg = null;
  try {
    // 从当前消息列表中提取 role 和 content，组装成发送给 AI 的请求消息
    const messages = currentMessages.value.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    // 属于简历项目
    if (type === "resume") {
      // 拼接 prompt 和 content 为一条消息
      const prompt = `data: ${JSON.stringify(currentData.value)}

      `;
      messages.at(-1).content = prompt + messages.at(-1).content;
    }
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
    const { sendFn, abortFn } = await getLLM().request({
      options: {
        input: messages,
        model: "deepseek-v4-flash-ga-260731",
        thinking: {
          // 根据设置控制深度思考模式
          type: thinkMode.value ? "enabled" : "disabled",
        },
      },
      debug: false,
      stream: true, // 开启流式响应
      // 简历模式下，需要解析 JSON 字符串
      isJson: type === "resume",
      // 流式事件回调
      onEvent: (type, data) => {
        if (type === "reasoning") {
          // 追加思考内容并滚动到底部
          lastMsg.thought += data;
        } else if (type === "content") {
          // 思考展开，并且首次收到回复内容，标记为完成。
          if (!lastMsg.thoughtCollapsed && !thoughtStatus) {
            thoughtStatus = true;
            lastMsg.thoughtCollapsed = true;
          }
          // 回复正文事件：逐字追加内容并滚动到底部
          lastMsg.content += data;
        } else if (type === "total_tokens") {
          // token 统计事件：保存本次消耗的 token 数
          lastMsg.total_tokens = data;
        }
        scrollToBottom();
      },
      // 请求失败回调
      onFail: (error) => {
        lastMsg.content = `请求出错: ${error.message || "未知错误"}`;
        lastMsg.typing = false;
        isSending.value = false;
        // 更新请求状态为失败状态
        lastMsg.requestStatus = "error";
      },
      // 请求成功回调（JSON格式）
      onSuccess: (res) => {
        const userData = res.result.data;
        console.log("userData:>> ", userData);
        applyDiff?.(userData);
        // 更新请求状态为成功状态
        lastMsg.requestStatus = "success";
        scrollToBottom();
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
    isGenerating.value = false;
    isSending.value = false;
    abortRequest = null;
    // 确保打字状态被关闭
    if (lastMsg?.typing) {
      lastMsg.typing = false;
    }
    // 更新对话的最后修改时间
    if (chat.value) {
      chat.value.updateTime = Date.now();
    }
    // 请求完成，把最后一条消息数据回调给父组件

    emit("requestComplete", lastMsg);
  }
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
 * 点击推荐问题，触发输入框发送
 */
const handleSendFollowQuestion = (question) => {
  handleSend(question);
};

/**
 * 删除消息，count 不传时删除该消息及其后的所有消息；返回是否删除成功
 */
function removeMessage(msg, count) {
  const messages = chat.value?.messages;
  if (!messages) return false;
  const index = messages.indexOf(msg);
  if (index > -1) {
    messages.splice(index, count ?? messages.length);
  }
  return index > -1;
}

/**
 * 撤回用户消息：删除该消息及其后的所有消息，并将内容回填到输入框
 */
const handleRecall = (msg) => {
  // 删除该消息及其后的所有消息
  if (removeMessage(msg)) {
    chat.value.updateTime = Date.now();
  }
  // 将撤回的内容回填到输入框，便于重新编辑
  chatInputRef.value?.setValue(msg.content);
};

/**
 * 重试生成：删除失败消息后重新发起请求
 */
const handleRetry = (msg) => {
  // 仅删除失败的这条消息
  removeMessage(msg, 1);
  isSending.value = true;
  scrollToBottom();
  handleAIResponse();
};
// 通过 provide 注入重试回调，供 aiMessage 直接调用
provide("retry", handleRetry);

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
</script>

<template>
  <div class="relative flex h-full w-full flex-col overflow-hidden select-text">
    <SfScrollbar ref="chatContainer" class="h-full w-full flex-1">
      <slot name="empty" v-if="currentMessages.length === 1">
        <WelcomeScreen @suggest="handleSuggest" />
      </slot>

      <div v-if="currentMessages.length > 1" class="flex h-full flex-col items-center p-3">
        <component
          :is="msg.role === 'user' ? UserMessage : AiMessage"
          v-for="(msg, index) in displayMessages"
          :key="index"
          :msg="msg"
          :index="index"
          @recall="handleRecall"
          @updateCollapsedStatus="updateCollapsedStatus"
          @sendFollowQuestion="handleSendFollowQuestion"
        />
      </div>
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
      :is-sending="isSending"
      @send="handleSend"
      @stop="stopGenerating"
    />
  </div>
</template>

<style scoped></style>
