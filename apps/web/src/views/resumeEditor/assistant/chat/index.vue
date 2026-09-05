<script setup lang="ts">
import { useAiStore } from "@/stores";
import { useScroll } from "@vueuse/core";
import { computed, nextTick, ref, watch } from "vue";
import { useChatRequest } from "./useChatRequest";
import type { AssistantConfig, Flow, SuggestCard } from "../types";

import AiMessage from "./aiMessage.vue";
import ChatInput from "./chatInput/index.vue";
import UserMessage from "./userMessage.vue";
import EmptyState from "./emptyState.vue";
import MessageNav from "./messageNav.vue";

const aiStore = useAiStore();
const { createDefaultMessage } = aiStore;
// 宿主传入的技能、工具与上下文配置
const props = defineProps<{
  config: AssistantConfig;
  flows: Record<string, Flow>;
  suggestions: SuggestCard[];
}>();
// 生成状态来自宿主注入的引用，模板与输入框共用
const generating = props.config.generating;
const isGenerating = computed(() => generating.value);

const chat = defineModel("chat", {
  required: true,
});

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

// 左侧消息导航：滚动定位到指定消息
function scrollToMessage(index) {
  const wrap = chatContainer.value?.wrapRef;
  if (!wrap) return;
  const target = wrap.querySelector(`[data-msg-index="${index}"]`);
  if (!target) return;
  const top =
    target.getBoundingClientRect().top - wrap.getBoundingClientRect().top + wrap.scrollTop;
  chatContainer.value.setScrollTop(Math.max(0, top - 12));
}

// 监听 chat 变化时滚动到底部并聚焦
watch(
  () => chat.value?.id,
  () => {
    scrollToBottom();
    nextTick(() => chatInputRef.value?.focus());
  },
  { immediate: true },
);

const { handleAIResponse, stopGenerating } = useChatRequest({
  chat,
  currentMessages,
  addMessage,
  scrollToBottom,
  config: props.config,
});

/**
 * 处理发送消息
 */
const handleSend = (content) => {
  // 确保输入内容不为空
  if (!content) return;
  // 确保当前没有正在发送的消息
  if (generating.value) return;
  // 引导流程的自由输入步骤：把输入内容作为答案推进流程
  if (activeFlow.value?.flow?.steps?.[activeFlow.value.stepIndex]?.input) {
    handleFlowInput(content);
    return;
  }
  generating.value = true;
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
 * 点击推荐问题，触发输入框发送
 */
const handleSendFollowQuestion = (question) => {
  // 引导流程中：将选项作为答案推进流程
  if (activeFlow.value) {
    handleFlowOption(question);
    return;
  }
  handleSend(question);
};

// 将推荐问题填入输入框，不触发发送
const handleFillFollowQuestion = (question) => {
  chatInputRef.value?.setValue(question);
  chatInputRef.value?.focus();
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
  generating.value = true;
  scrollToBottom();
  handleAIResponse();
};
// 通过 provide 注入重试回调，供 aiMessage 直接调用
provide("retry", handleRetry);

// 引导式流程状态：记录当前流程、步骤与已收集的选项
const activeFlow = ref(null);

/**
 * 点击建议卡片：启动引导式对话流程
 */
const handleSuggest = (payload) => {
  const flow = props.flows[payload?.flow];
  if (!flow) return;
  // 记录流程状态并展示初始用户消息
  activeFlow.value = { flow, stepIndex: 0, answers: [] };
  // 引导对话仅作界面展示，不加入请求上下文
  addMessage({
    role: "user",
    content: flow.userContent,
    typing: false,
    skipContext: true,
  });
  scrollToBottom();
  // 展示第一轮预设询问
  runFlowStep();
};

/**
 * 展示当前步骤的预设询问，复用 followQuestions 作为选项按钮
 */
const runFlowStep = () => {
  const state = activeFlow.value;
  const step = state?.flow?.steps?.[state.stepIndex];
  if (!step) return;
  // 引导对话仅作界面展示，不加入请求上下文
  addMessage({
    role: "assistant",
    content: JSON.stringify({
      data: null,
      analysis: step.question,
      // 自由输入步骤不展示选项按钮，等待用户直接输入
      followQuestions: step.input ? [] : step.options,
    }),
    typing: false,
    requestStatus: "success",
    skipContext: true,
  });
  scrollToBottom();
};

/**
 * 推进流程答案：记录答案并推进步骤，收集完成后发起真实请求
 */
const handleFlowAnswer = (answer) => {
  const state = activeFlow.value;
  if (!state) return;
  // 记录答案并展示为用户消息
  state.answers.push(answer);
  // 引导对话仅作界面展示，不加入请求上下文
  addMessage({
    role: "user",
    content: answer,
    typing: false,
    skipContext: true,
  });
  scrollToBottom();
  // 推进到下一步
  state.stepIndex += 1;
  if (state.stepIndex < state.flow.steps.length) {
    runFlowStep();
    return;
  }
  // 收集完成：构造真实请求并清空流程状态
  const { prompt, userContent } = state.flow.build(state.answers);
  activeFlow.value = null;
  // 所有请求统一走 React 编排
  if (prompt) {
    addMessage({
      role: "system",
      content: prompt,
      typing: false,
    });
  }
  addMessage({
    role: "user",
    content: userContent,
    typing: false,
  });
  generating.value = true;
  scrollToBottom();
  handleAIResponse();
};

/**
 * 处理流程中的选项点击：记录答案并推进流程
 */
const handleFlowOption = (option) => {
  handleFlowAnswer(option);
};

/**
 * 处理流程中的自由输入：把输入框内容作为答案推进流程
 */
const handleFlowInput = (content) => {
  handleFlowAnswer(content);
};
</script>

<template>
  <div class="relative flex h-full w-full flex-col overflow-hidden select-text">
    <SfScrollbar ref="chatContainer" class="h-full w-full flex-1">
      <EmptyState
        :suggestions="props.suggestions"
        @suggest="handleSuggest"
        v-if="displayMessages.length === 0"
      />

      <div v-if="displayMessages.length > 0" class="flex h-full flex-col items-center py-3">
        <component
          :is="msg.role === 'user' ? UserMessage : AiMessage"
          v-for="(msg, index) in displayMessages"
          :key="index"
          :msg="msg"
          :index="index"
          :data-msg-index="index"
          :is-last="index === displayMessages.length - 1"
          @recall="handleRecall"
          @updateCollapsedStatus="updateCollapsedStatus"
          @sendFollowQuestion="handleSendFollowQuestion"
          @fillFollowQuestion="handleFillFollowQuestion"
        />
      </div>
    </SfScrollbar>

    <!-- 左侧消息导航：悬停展开查看全部消息，点击跳转 -->
    <MessageNav
      v-if="displayMessages.length"
      :messages="displayMessages"
      @select="scrollToMessage"
    />

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
        <SfIcon
          icon="mingcute:arrow-down-line"
          size="4"
          boxSize="8"
          class="rounded-full border border-sf-b bg-sf-bg"
          @click="scrollToBottom"
        />
      </div>
    </Transition>

    <ChatInput
      ref="chatInputRef"
      :is-generating="isGenerating"
      @send="handleSend"
      @stop="stopGenerating"
    />
  </div>
</template>

<style scoped></style>
