<script setup lang="ts">
import { useAiStore, useResumeStore, type Chat } from "@/stores";
import { useClipboard, useScroll } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useChatRequest } from "./useChatRequest";
import { ALL_MODULE_KEY, ALL_MODULE_NAME } from "@/stores/modules/resume/defaultConfig";
import { flows, suggestions } from "../flows";
import { supportsInterviewEarlyEnd } from "../interview/flows";
import { supportsQuickAnswer, useInterviewQuickAnswer } from "../interview/quickAnswer";
import { useResumeAssistant } from "../useResumeAssistant";

import AiMessage from "./aiMessage.vue";
import ChatInput from "./chatInput/index.vue";
import UserMessage from "./userMessage.vue";
import EmptyState from "./emptyState/index.vue";
import ChatHeader from "./header/index.vue";
import ChatList from "./chatList.vue";

const aiStore = useAiStore();
const resumeStore = useResumeStore();
const { createDefaultMessage } = aiStore;
// 组装简历域技能、工具与对话创建方法
const { config: assistantConfig, createChat: createAssistantChat } = useResumeAssistant();
// 面试回答使用独立的一次性请求，不进入主对话的技能与工具循环
const { requestQuickAnswer } = useInterviewQuickAnswer();
// 把会话工厂注册到 ai store，供新建话题入口调用
aiStore.registerResumeAssistantChatFactory(createAssistantChat);
const { resumeAssistantChat, resumeAssistantChatList } = storeToRefs(aiStore);
const { selectedModule } = storeToRefs(resumeStore);
// 当前话题未产生用户消息前仅保存在组件内，避免空会话写入持久化列表
const draftChat = ref<Chat | null>(null);
// 当前简历只展示自身的助手对话
const resumeId = computed(() => resumeStore.currentItem?.id || "");
const resumeAssistantChats = computed(() =>
  resumeAssistantChatList.value.filter((item) => item.resumeId === resumeId.value),
);
// 当前操作模块列表：有选中模块时展示真实模块，无选中时补“整个简历”兜底项
const selectedModules = computed(() =>
  selectedModule.value.length
    ? selectedModule.value
    : [{ key: ALL_MODULE_KEY, name: ALL_MODULE_NAME }],
);
// 点击模块标签右上角关闭按钮时取消选中，统一走 store 操作
const removeSelectedModule = (key: string) => {
  resumeStore.unselectModule(key);
};
const chat = computed({
  get: () => draftChat.value ?? resumeAssistantChat.value!,
  set: (value) => {
    if (draftChat.value?.id === value.id) draftChat.value = value;
    else resumeAssistantChat.value = value;
  },
});
// 生成状态来自宿主注入的引用，模板与输入框共用
const generating = assistantConfig.generating;
const isGenerating = computed(() => generating.value);
// 控制会话记录第二页的显示状态
const chatListVisible = ref(false);
// 专项面试期间开放语音转文字入口，其余简历任务保持原输入方式
const voiceInputEnabled = ref(false);
// 长时面试流程启动后持续提供提前结束入口
const earlyEndEnabled = ref(false);
// 面试流程启动后开放快速回答，结果通过独立弹窗展示
const quickAnswerEnabled = ref(false);
const quickAnswerLoading = ref(false);
const quickAnswerVisible = ref(false);
const quickAnswerContent = ref("");
const quickAnswerError = ref("");
const {
  copy: copyQuickAnswer,
  isSupported: quickAnswerCopySupported,
} = useClipboard();

function createNewChat() {
  if (generating.value || quickAnswerLoading.value) return;
  draftChat.value = aiStore.createNewResumeAssistantChat() ?? null;
  voiceInputEnabled.value = false;
  earlyEndEnabled.value = false;
  quickAnswerEnabled.value = false;
  quickAnswerVisible.value = false;
  chatListVisible.value = false;
}

function selectChat(id: string) {
  if (generating.value || quickAnswerLoading.value) return;
  draftChat.value = null;
  aiStore.switchResumeAssistantChat(id);
  voiceInputEnabled.value = false;
  earlyEndEnabled.value = false;
  quickAnswerEnabled.value = false;
  quickAnswerVisible.value = false;
  chatListVisible.value = false;
}

// currentMessages：从 chat.messages 派生
const currentMessages = computed(() => chat.value?.messages ?? []);
// 过滤掉 system 消息后的显示列表
const displayMessages = computed(() => {
  return currentMessages.value.filter((m) => m.role !== "system");
});
// 快速回答只读取最近一条真实 AI 回复，忽略流程引导消息
const latestInterviewQuestion = computed(
  () =>
    [...currentMessages.value]
      .reverse()
      .find(
        (message) =>
          message.role === "assistant" &&
          !message.skipContext &&
          message.requestStatus === "success" &&
          !!message.content?.trim(),
      )?.content.trim() || "",
);
// 消息导航仅展示用户消息
const navMessages = computed(() => displayMessages.value.filter((msg) => msg.role === "user"));
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
  aiStore.updateResumeAssistantChatTitle(chat.value);
  if (msg.role === "user") saveDraftChat();
}

// 用户首次发起对话时，将草稿转入现有持久化列表
function saveDraftChat() {
  const draft = draftChat.value;
  if (!draft || draft.resumeId !== resumeId.value) return;
  aiStore.saveResumeAssistantChat(draft);
  draftChat.value = null;
}
// 聊天容器的引用，用于滚动
const chatContainer = ref(null);

// 是否跟随生成内容自动滚动：初始视为位于底部，用户上滑离开后关闭，回到底部后恢复
const followOutput = ref(true);
// 滚动监听，用于显示回到底部按钮
const scrollTarget = computed(() => chatContainer.value?.wrapRef);
const { arrivedState } = useScroll(scrollTarget, {
  // 每次滚动后按是否到达底部同步跟随状态
  onScroll: () => {
    followOutput.value = arrivedState.bottom;
  },
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
let scrollFrame = 0;
const scrollWaiters: Array<(value?: unknown) => void> = [];
const flushScrollWaiters = () => {
  const waiters = scrollWaiters.splice(0);
  waiters.forEach((resolve) => resolve());
};
// 将流式消息触发的多次滚动合并到同一帧，避免重复读取布局与写入滚动位置
const scrollToBottom = () => {
  const promise = new Promise((resolve) => scrollWaiters.push(resolve));
  if (scrollFrame) return promise;
  scrollFrame = requestAnimationFrame(async () => {
    scrollFrame = 0;
    await nextTick();
    if (chatContainer.value?.wrapRef) {
      chatContainer.value.setScrollTop(chatContainer.value.wrapRef.scrollHeight);
    }
    flushScrollWaiters();
  });
  return promise;
};

onBeforeUnmount(() => {
  if (scrollFrame) cancelAnimationFrame(scrollFrame);
  scrollFrame = 0;
  flushScrollWaiters();
});

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
// 消息导航选择后定位到聊天列表中的原消息
function handleNavSelect(msg) {
  const index = displayMessages.value.indexOf(msg);
  if (index > -1) scrollToMessage(index);
}

// 未变化的历史消息跳过父列表更新，生成中的消息仍按内容与状态变化刷新
const getMessageMemo = (msg, index) => [
  msg.id || index,
  msg.content,
  msg.thought,
  msg.typing,
  msg.requestStatus,
  msg.stepLabel,
  msg.contentCollapsed,
  msg.thoughtCollapsed,
  msg.total_tokens,
  msg.thoughtTime,
  msg.contentTime,
  msg.followQuestions?.join("\u0000"),
  index === displayMessages.value.length - 1,
  hasWriteChanges(msg),
];

// 监听 chat 变化时滚动到底部并聚焦
watch(
  () => chat.value?.id,
  () => {
    scrollToBottom();
    nextTick(() => chatInputRef.value?.focus());
  },
  { immediate: true },
);

// 生成内容期间仅在用户仍位于底部时自动跟随滚动，避免强制打断用户上滑阅读
const followContentScroll = async () => {
  if (!followOutput.value) return;
  await scrollToBottom();
};

const { handleAIResponse, stopGenerating, withdrawAI, hasWriteChanges } = useChatRequest({
  chat,
  currentMessages,
  addMessage,
  scrollToBottom: followContentScroll,
  config: assistantConfig,
});

// 切换简历时先取消旧会话请求，再恢复目标简历的助手对话
watch(
  resumeId,
  (id, previousId) => {
    if (previousId && id !== previousId) stopGenerating();
    const savedChat = id ? aiStore.initializeResumeAssistantChat(id) : null;
    draftChat.value = savedChat || !id ? null : (aiStore.createNewResumeAssistantChat() ?? null);
  },
  { immediate: true },
);

/**
 * 处理发送消息
 */
const handleSend = (content) => {
  // 确保输入内容不为空
  if (!content) return;
  // 确保当前没有正在发送的消息
  if (generating.value || quickAnswerLoading.value) return;
  // 引导流程的自由输入步骤：把输入内容作为答案推进流程
  const flowStep = activeFlow.value?.steps?.[activeFlow.value.stepIndex];
  if (flowStep) {
    // 无可用选项的步骤同样允许自由输入，避免流程卡死
    const options = typeof flowStep.options === "function" ? flowStep.options() : flowStep.options;
    if (flowStep.input || !options.length) {
      handleFlowInput(content);
      return;
    }
  }
  // 用户结束长时评估后关闭专用操作入口，后续仅保留普通对话输入
  if (earlyEndEnabled.value && content.trim() === "提前结束") {
    earlyEndEnabled.value = false;
    voiceInputEnabled.value = false;
    quickAnswerEnabled.value = false;
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
// 重新生成：回滚本轮修改并删除回复，复用上一轮请求重新发起
function handleRegenerate(index) {
  const msg = displayMessages.value[index];
  if (!msg || generating.value) return;
  withdrawAI(msg);
  removeMessage(msg);
  scrollToBottom();
  handleAIResponse();
}
// 撤回修改：恢复请求前备份，回复文字保留、操作按钮消失
function handleWithdrawModify(index) {
  const msg = displayMessages.value[index];
  if (!msg) return;
  withdrawAI(msg);
  ElMessage.success("已撤回 AI 修改");
}
// 通过 provide 注入重试回调，供 aiMessage 直接调用
provide("retry", handleRetry);

// 引导式流程状态：记录当前流程、步骤与已收集的选项
const activeFlow = ref(null);

/**
 * 点击建议卡片：启动引导式对话流程
 */
const handleSuggest = (payload) => {
  const flow = flows[payload?.flow];
  if (!flow) return;
  const allowQuickAnswer = supportsQuickAnswer(payload.flow);
  const allowEarlyEnd = supportsInterviewEarlyEnd(payload.flow);
  // 仅专项面试模拟启用语音输入，启动其他流程时同步关闭
  voiceInputEnabled.value = payload.flow === "specializedInterview";
  earlyEndEnabled.value = false;
  quickAnswerEnabled.value = false;
  // 记录流程状态并展示初始用户消息
  // 流程启动时固化条件步骤，保证本轮授权判断与入口状态一致
  const steps = flow.steps.filter((step) => step.when?.() ?? true);
  // 无前置问答的流程直接发起真实请求，避免停留在空引导状态
  if (!steps.length) {
    const { prompt, userContent, requestContext } = flow.build([]);
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
      requestContext,
    });
    // 无引导步骤的长时流程在真实请求开始后开放提前结束
    earlyEndEnabled.value = allowEarlyEnd;
    // 真实面试请求开始后才开放快速回答，避免回答入口配置问题
    quickAnswerEnabled.value = allowQuickAnswer;
    generating.value = true;
    scrollToBottom();
    handleAIResponse();
    return;
  }
  activeFlow.value = {
    flow,
    steps,
    stepIndex: 0,
    answers: [],
    allowEarlyEnd,
    allowQuickAnswer,
  };
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
  const step = state?.steps?.[state.stepIndex];
  if (!step) return;
  // 动态选项在展示时求值；无可用选项时退回自由输入
  const options = typeof step.options === "function" ? step.options() : step.options;
  const needInput = step.input || !options.length;
  // 引导对话仅作界面展示，不加入请求上下文
  addMessage({
    role: "assistant",
    content: step.question,
    // 自由输入或无可选项时不展示选项按钮，等待用户直接输入
    followQuestions: needInput ? [] : options,
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
  const step = state.steps[state.stepIndex];
  // 授权被拒绝时只结束引导流程，不向模型发送请求
  if (step?.cancelAnswers?.includes(answer)) {
    addMessage({ role: "user", content: answer, typing: false, skipContext: true });
    addMessage({
      role: "assistant",
      content: step.cancelMessage || "已取消本次操作。",
      typing: false,
      requestStatus: "success",
      skipContext: true,
    });
    activeFlow.value = null;
    scrollToBottom();
    return;
  }
  // 仅收集构造最终请求所需的业务答案，授权答案不混入请求参数
  if (step?.collectAnswer !== false) state.answers.push(answer);
  // 推进到下一步
  state.stepIndex += 1;
  if (state.stepIndex < state.steps.length) {
    // 中间步骤答案仅作界面展示，不加入请求上下文
    addMessage({
      role: "user",
      content: answer,
      typing: false,
      skipContext: true,
    });
    scrollToBottom();
    runFlowStep();
    return;
  }
  // 收集完成：最后一步答案并入真实请求，不再单独展示，避免出现两条 user 消息
  const { prompt, userContent, requestContext } = state.flow.build(state.answers);
  // 完成入口问答后再展示提前结束，避免尚未开始评估时误触
  earlyEndEnabled.value = state.allowEarlyEnd;
  quickAnswerEnabled.value = state.allowQuickAnswer;
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
    requestContext,
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

// 提前结束使用普通用户消息触发技能收尾与阶段性评分
const handleEarlyEnd = () => {
  if (!earlyEndEnabled.value || generating.value) return;
  handleSend("提前结束");
};

// 执行单次回答请求；换一个时仅把上一版作为差异化参考
const generateQuickAnswer = async (previousAnswer = "") => {
  quickAnswerLoading.value = true;
  quickAnswerError.value = "";
  try {
    quickAnswerContent.value = await requestQuickAnswer(
      latestInterviewQuestion.value,
      previousAnswer,
    );
  } catch (error: any) {
    quickAnswerError.value = error?.message || "回答生成失败";
  } finally {
    quickAnswerLoading.value = false;
  }
};

// 为最近一道真实面试题生成一个独立回答方案，不写入当前会话消息
const handleQuickAnswer = async () => {
  if (!quickAnswerEnabled.value || generating.value || quickAnswerLoading.value) return;
  if (!latestInterviewQuestion.value) {
    ElMessage.warning("暂无可回答的面试题");
    return;
  }
  quickAnswerVisible.value = true;
  quickAnswerContent.value = "";
  await generateQuickAnswer();
};

// 保留同一道题与简历事实，以不同表达重新生成单个回答方案
const handleReplaceQuickAnswer = async () => {
  if (quickAnswerLoading.value) return;
  await generateQuickAnswer(quickAnswerContent.value);
};

// 复制当前回答方案，失败时提供明确反馈
const handleCopyQuickAnswer = async () => {
  if (!quickAnswerContent.value) return;
  if (!quickAnswerCopySupported.value) {
    ElMessage.error("当前浏览器不支持复制");
    return;
  }
  await copyQuickAnswer(quickAnswerContent.value);
  ElMessage.success("回答方案已复制");
};
</script>

<template>
  <div class="relative flex h-full w-full flex-col overflow-hidden rounded-r-3xl select-text">
    <ChatHeader
      :messages="navMessages"
      :is-generating="isGenerating"
      @open-chat-list="chatListVisible = true"
      @new-chat="createNewChat"
      @select="handleNavSelect"
    />
    <SfScrollbar ref="chatContainer" class="w-full flex-1">
      <EmptyState
        :suggestions="suggestions"
        :selected-modules="selectedModules"
        :remove-module="removeSelectedModule"
        @suggest="handleSuggest"
        v-if="displayMessages.length === 0"
      />

      <div v-if="displayMessages.length > 0" class="flex h-full flex-col items-center py-3">
        <component
          :is="msg.role === 'user' ? UserMessage : AiMessage"
          v-for="(msg, index) in displayMessages"
          v-memo="getMessageMemo(msg, index)"
          :key="msg.id"
          :msg="msg"
          :index="index"
          :data-msg-index="index"
          :is-last="index === displayMessages.length - 1"
          :can-withdraw="hasWriteChanges(msg)"
          @recall="handleRecall"
          @updateCollapsedStatus="updateCollapsedStatus"
          @sendFollowQuestion="handleSendFollowQuestion"
          @fillFollowQuestion="handleFillFollowQuestion"
          @regenerate="handleRegenerate"
          @withdraw-modify="handleWithdrawModify"
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
      <div v-if="showScrollBottom" class="absolute bottom-42 left-1/2 z-9 -translate-x-1/2">
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
      :voice-enabled="voiceInputEnabled"
      :early-end-enabled="earlyEndEnabled"
      :quick-answer-enabled="quickAnswerEnabled"
      :quick-answer-loading="quickAnswerLoading"
      @send="handleSend"
      @stop="stopGenerating"
      @early-end="handleEarlyEnd"
      @quick-answer="handleQuickAnswer"
    />

    <SfModal v-model="quickAnswerVisible" title="面试回答方案" width="560px">
      <div class="flex min-h-30 w-full flex-col gap-3 text-left">
        <!-- 单次请求加载期间只展示状态，不产生主对话消息 -->
        <div
          v-if="quickAnswerLoading"
          class="flex min-h-30 items-center justify-center gap-3 text-sm text-sf-text-2"
        >
          <SfIcon icon="eos-icons:loading" size="5" class="text-sf-theme" />
          正在生成回答方案
        </div>
        <p
          v-else-if="quickAnswerError"
          class="rounded-xl bg-sf-error-2 p-3 text-sm leading-relaxed text-sf-error"
        >
          {{ quickAnswerError }}
        </p>
        <p v-else class="whitespace-pre-wrap text-sm leading-relaxed text-sf-text">
          {{ quickAnswerContent }}
        </p>
        <div v-if="!quickAnswerLoading" class="flex justify-end gap-3 pt-3">
          <SfButton
            v-if="quickAnswerContent"
            type="bg"
            size="large"
            @click="handleCopyQuickAnswer"
          >
            复制
          </SfButton>
          <SfButton type="bg" size="large" @click="handleReplaceQuickAnswer">换一个</SfButton>
          <SfButton size="large" @click="quickAnswerVisible = false">关闭</SfButton>
        </div>
      </div>
    </SfModal>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div v-if="chatListVisible" class="absolute inset-0 z-20 bg-sf-primary">
        <ChatList
          :chats="resumeAssistantChats"
          :active-chat-id="chat.id"
          :disabled="isGenerating"
          @close="chatListVisible = false"
          @create="createNewChat"
          @select="selectChat"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped></style>
