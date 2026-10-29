<script setup lang="ts">
import {
  useAiStore,
  useResumeStore,
  type Chat,
  type Message,
  type ResumeAssistantChatRecord,
} from "@/stores";
import { useScroll } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { computed, inject, nextTick, onActivated, onBeforeUnmount, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { debounce } from "lodash-es";
import { useChatRequest } from "./useChatRequest";
import { ALL_MODULE_KEY, ALL_MODULE_NAME } from "@/stores/modules/resume/config/defaultConfig";
import { useResumeAiAvailability } from "@/views/resume/hooks/useResumeAiAvailability";
import { flows, suggestions } from "../flows";
import type { Flow, FlowStep, SuggestCard } from "../types";
import { useResumeAssistant } from "../useResumeAssistant";

import AiMessage from "./aiMessage.vue";
import ChatInput from "./chatInput/index.vue";
import UserMessage from "./userMessage.vue";
import EmptyState from "./emptyState/index.vue";
import ChatHeader from "./header/index.vue";
import ChatList from "./chatList.vue";

// 聊天组件只依赖滚动与输入公开方法，避免空引用被推断为不可访问类型
type ChatContainerInstance = {
  // 实际滚动容器
  wrapRef: HTMLElement;
  // 设置滚动位置
  setScrollTop: (top: number) => void;
};
type ChatInputInstance = {
  // 聚焦输入框
  focus: () => void;
  // 回填输入内容
  setValue: (value: string) => void;
};
type ActiveFlowState = {
  // 当前流程定义
  flow: Flow;
  // 流程稳定标识
  flowKey: string;
  // 本轮已经固化的引导步骤
  steps: FlowStep[];
  // 当前步骤位置
  stepIndex: number;
  // 已收集的业务答案
  answers: string[];
};

const aiStore = useAiStore();
const resumeStore = useResumeStore();
const { createDefaultMessage } = aiStore;
// 发起请求前检查小舟模型是否已绑定，未绑定时引导用户前往配置
const { ensureAiAvailable } = useResumeAiAvailability();
// 组装简历域技能、工具与对话创建方法
const { config: assistantConfig, createChat: createAssistantChat } = useResumeAssistant();
// 把会话工厂注册到 ai store，供新建话题入口调用
aiStore.registerResumeAssistantChatFactory(createAssistantChat);
const { resumeAssistantChat } = storeToRefs(aiStore);
const { selectedModule } = storeToRefs(resumeStore);
// 当前话题未产生用户消息前仅保存在组件内，避免空会话写入持久化列表
const draftChat = ref<Chat | null>(null);
const isChatLoading = ref(false);
let chatLoadToken = 0;
let hasActivated = false;
// 当前简历只展示自身的助手对话
const resumeId = computed(() => resumeStore.currentItem?.id || "");
const resumeAssistantChats = computed(
  () => resumeStore.list.find((item) => item.id === resumeId.value)?.ai || [],
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
    else resumeAssistantChat.value = value as ResumeAssistantChatRecord;
  },
});
// 生成状态来自宿主注入的引用，模板与输入框共用
const generating = assistantConfig.generating;
const isGenerating = computed(() => generating.value);
// 编辑器检查入口请求的流程在 AI 面板异步挂载后统一消费。
const pendingAssistantFlow = inject("resumeAssistantPendingFlow", ref(""));
// 控制会话记录第二页的显示状态
const chatListVisible = ref(false);

function createNewChat() {
  if (generating.value) return;
  draftChat.value = aiStore.createNewResumeAssistantChat() ?? null;
  chatListVisible.value = false;
}

// AI 标签再次进入时始终回到空白话题，不沿用离开前的会话标识。
onActivated(() => {
  if (hasActivated) createNewChat();
  hasActivated = true;
});

async function selectChat(id: string) {
  if (generating.value) return;
  const draft = aiStore.createNewResumeAssistantChat() ?? null;
  draftChat.value = draft;
  isChatLoading.value = true;
  const token = ++chatLoadToken;
  const selected = await aiStore.switchResumeAssistantChat(id);
  if (token !== chatLoadToken) return;
  if (selected) draftChat.value = null;
  isChatLoading.value = false;
  chatListVisible.value = false;
}

// currentMessages：从 chat.messages 派生
const currentMessages = computed(() => chat.value?.messages ?? []);
// 过滤掉 system 消息后的显示列表
const displayMessages = computed(() => {
  return currentMessages.value.filter((m) => m.role !== "system");
});
// 消息导航仅展示用户消息
const navMessages = computed(() => displayMessages.value.filter((msg) => msg.role === "user"));
// 切换消息折叠状态
function updateCollapsedStatus(index: number, type: "content" | "thought") {
  // 消息被删除或切换后不再操作旧下标
  const message = displayMessages.value[index];
  if (!message) return;
  const field = type === "content" ? "contentCollapsed" : "thoughtCollapsed";
  message[field] = !message[field];
}
/**
 * 向当前对话追加一条消息
 */
function addMessage(msg: Partial<Message>) {
  if (!chat.value) return;
  chat.value.messages.push({
    ...createDefaultMessage(),
    ...msg,
  });
  chat.value.updateTime = Date.now();
  aiStore.updateResumeAssistantChatTitle(chat.value);
  if (msg.role === "user") void saveDraftChat();
}

// 用户首次发起对话时，将草稿转入现有持久化列表
async function saveDraftChat() {
  const draft = draftChat.value;
  if (!draft || draft.resumeId !== resumeId.value) return;
  const savedChat = await aiStore.saveResumeAssistantChat(draft);
  if (savedChat && draftChat.value?.id === draft.id) draftChat.value = null;
}
const persistSavedChat = debounce((savedChat: Chat) => {
  void aiStore.persistResumeAssistantChat(savedChat);
}, 300);
watch(
  chat,
  (value) => {
    if (!value || draftChat.value) return;
    persistSavedChat(value);
  },
  { deep: true },
);
// 聊天容器的引用，用于滚动
const chatContainer = ref<ChatContainerInstance | null>(null);

// 是否跟随生成内容自动滚动：初始视为位于底部，用户上滑离开后关闭，回到底部后恢复
const followOutput = ref(true);
// 滚动监听，用于显示回到底部按钮
const scrollTarget = computed(() => chatContainer.value?.wrapRef);
let previousScrollTop = 0;
const { arrivedState } = useScroll(scrollTarget, {
  // 只有用户确实向上滚动时才暂停跟随，内容增长造成的离底不视为用户操作。
  onScroll: () => {
    const wrap = scrollTarget.value;
    if (!wrap) return;
    const currentScrollTop = wrap.scrollTop;
    const bottomDistance = wrap.scrollHeight - wrap.clientHeight - currentScrollTop;
    if (bottomDistance <= 2) followOutput.value = true;
    else if (currentScrollTop < previousScrollTop - 1) followOutput.value = false;
    previousScrollTop = currentScrollTop;
  },
});

const showScrollBottom = computed(() => {
  // 如果没有消息或者已经触底，则不显示
  if (currentMessages.value.length === 0 || arrivedState.bottom) return false;
  return true;
});
// ChatInput 组件的引用，用于聚焦
const chatInputRef = ref<ChatInputInstance | null>(null);

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
      const wrap = chatContainer.value.wrapRef;
      // 主动滚到底部代表恢复跟随，后续流式内容继续贴住最新位置。
      followOutput.value = true;
      chatContainer.value.setScrollTop(wrap.scrollHeight);
      previousScrollTop = Math.max(0, wrap.scrollHeight - wrap.clientHeight);
    }
    flushScrollWaiters();
  });
  return promise;
};

onBeforeUnmount(() => {
  persistSavedChat.flush();
  if (scrollFrame) cancelAnimationFrame(scrollFrame);
  scrollFrame = 0;
  flushScrollWaiters();
});

// 左侧消息导航：滚动定位到指定消息
function scrollToMessage(index: number) {
  const wrap = chatContainer.value?.wrapRef;
  if (!wrap) return;
  const target = wrap.querySelector(`[data-msg-index="${index}"]`);
  if (!target) return;
  const top =
    target.getBoundingClientRect().top - wrap.getBoundingClientRect().top + wrap.scrollTop;
  chatContainer.value?.setScrollTop(Math.max(0, top - 12));
}
// 消息导航选择后定位到聊天列表中的原消息
function handleNavSelect(msg: Message) {
  const index = displayMessages.value.indexOf(msg);
  if (index > -1) scrollToMessage(index);
}

// 未变化的历史消息跳过父列表更新，生成中的消息仍按内容与状态变化刷新
const getMessageMemo = (msg: Message, index: number) => [
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
  msg.writeSummary,
  getMessageChanges(msg),
  msg.agentRun?.steps?.length,
  msg.agentRun?.durationMs,
  msg.agentRun?.task?.phase,
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

const { handleAIResponse, stopGenerating, withdrawAI, hasWriteChanges, getMessageChanges } = useChatRequest({
  chat,
  currentMessages,
  addMessage,
  scrollToBottom: followContentScroll,
  config: assistantConfig,
});

// 切换简历时先取消旧会话请求，并为目标简历创建空白话题。
watch(
  resumeId,
  (id, previousId) => {
    ++chatLoadToken;
    if (previousId && id !== previousId) stopGenerating();
    resumeAssistantChat.value = null;
    draftChat.value = id ? (aiStore.createNewResumeAssistantChat() ?? null) : null;
    if (!id) {
      isChatLoading.value = false;
      return;
    }
    isChatLoading.value = false;
  },
  { immediate: true },
);

/**
 * 处理发送消息
 */
const handleSend = (content: string) => {
  // 确保输入内容不为空
  if (!content?.trim()) return;
  // 确保当前没有正在发送的消息
  if (generating.value || isChatLoading.value) return;
  // 发起聊天前先判断是否已绑定 AI 模型，未绑定则不进入请求
  if (!ensureAiAvailable()) return;
  // 引导流程的自由输入步骤：把输入内容作为答案推进流程
  const flowStep = activeFlow.value?.steps?.[activeFlow.value.stepIndex];
  if (flowStep) {
    // 引导期间所有输入都作为本步骤答案，不能绕过授权或选择步骤启动请求
    handleFlowAnswer(content.trim());
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
const handleSendFollowQuestion = (question: string) => {
  // 引导流程中：将选项作为答案推进流程
  if (activeFlow.value) {
    handleFlowOption(question);
    return;
  }
  handleSend(question);
};

// 将推荐问题填入输入框，不触发发送
const handleFillFollowQuestion = (question: string) => {
  chatInputRef.value?.setValue(question);
  chatInputRef.value?.focus();
};

/**
 * 删除消息，count 不传时删除该消息及其后的所有消息；返回是否删除成功
 */
function removeMessage(msg: Message, count?: number) {
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
const handleRecall = (msg: Message) => {
  if (generating.value || isChatLoading.value) return;
  // 撤回引导消息后取消尚未完成的流程，避免继续使用旧答案
  activeFlow.value = null;
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
const handleRetry = (msg: Message) => {
  if (generating.value || isChatLoading.value) return;
  // 只重试当前轮，已写入内容先撤回，避免重复新增或重复删除
  if (msg !== displayMessages.value.at(-1)) return;
  if (msg.hasWriteChanges && !withdrawAI(msg)) {
    ElMessage.warning("本轮修改备份已失效，请核对简历后重新发送请求");
    return;
  }
  removeMessage(msg, 1);
  generating.value = true;
  scrollToBottom();
  handleAIResponse();
};
// 重新生成：回滚本轮修改并删除回复，复用上一轮请求重新发起
function handleRegenerate(index: number) {
  const msg = displayMessages.value[index];
  if (!msg || generating.value || isChatLoading.value) return;
  // 历史写入没有内存备份时不能重新执行，避免累积重复修改
  if (msg.hasWriteChanges && !withdrawAI(msg)) {
    ElMessage.warning("本轮修改备份已失效，请核对简历后重新发送请求");
    return;
  }
  removeMessage(msg);
  scrollToBottom();
  handleAIResponse();
}
// 撤回修改：恢复请求前备份，回复文字保留、操作按钮消失
function handleWithdrawModify(index: number) {
  const msg = displayMessages.value[index];
  if (!msg || generating.value || isChatLoading.value) return;
  // 仅恢复成功时提示撤回完成
  if (withdrawAI(msg)) ElMessage.success("已撤回 AI 修改");
}
// 通过 provide 注入重试回调，供 aiMessage 直接调用
provide("retry", handleRetry);

// 引导式流程状态：记录当前流程、步骤与已收集的选项
const activeFlow = ref<ActiveFlowState | null>(null);
// 会话切换清除未完成的简历引导。
watch(
  () => chat.value?.id,
  () => {
    activeFlow.value = null;
  },
);

/**
 * 点击建议卡片：启动引导式对话流程
 */
const handleSuggest = (payload: Pick<SuggestCard, "flow">) => {
  if (generating.value || isChatLoading.value) return;
  // 选择工作流一键操作前先判断是否已绑定 AI 模型，未绑定则不启动流程
  if (!ensureAiAvailable()) return;
  const flow = flows[payload?.flow];
  if (!flow) return;
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
      // 功能入口身份只记录在按钮请求上，避免普通聊天误判为再次点击。
      requestContext: {
        ...requestContext,
        entryFlow: payload.flow, // 用户点击的功能入口。
      },
    });
    generating.value = true;
    scrollToBottom();
    handleAIResponse();
    return;
  }
  activeFlow.value = {
    // 当前流程定义
    flow,
    // 流程稳定标识，供续轮与历史会话恢复
    flowKey: payload.flow,
    // 本轮已经固化的引导步骤
    steps,
    // 当前步骤位置
    stepIndex: 0,
    // 已收集的业务答案
    answers: [],
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
const handleFlowAnswer = (answer: string) => {
  const state = activeFlow.value;
  if (!state || generating.value || isChatLoading.value) return;
  const step = state.steps[state.stepIndex];
  if (!step || !answer?.trim()) return;
  // 选择步骤只接受本轮有效选项，拒绝旧按钮或自由输入跳过授权
  const options = typeof step.options === "function" ? step.options() : step.options;
  if (!step.input && options.length && !options.includes(answer)) {
    ElMessage.warning("请先选择当前步骤中的选项");
    return;
  }
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
    // 功能入口身份只记录在按钮请求上，避免普通聊天误判为再次点击。
    requestContext: {
      ...requestContext,
      entryFlow: state.flowKey, // 用户点击的功能入口。
    },
  });
  generating.value = true;
  scrollToBottom();
  handleAIResponse();
};

/**
 * 处理流程中的选项点击：记录答案并推进流程
 */
const handleFlowOption = (option: string) => {
  handleFlowAnswer(option);
};

/**
 * 处理流程中的自由输入：把输入框内容作为答案推进流程
 */
const handleFlowInput = (content: string) => {
  handleFlowAnswer(content);
};

// 等待助手空闲后为一键任务创建独立对话，避免继承已有聊天上下文。
watch(
  [pendingAssistantFlow, generating, isChatLoading],
  ([flow, isGeneratingNow, isLoading]) => {
    if (!flow || isGeneratingNow || isLoading) return;
    pendingAssistantFlow.value = "";
    createNewChat();
    handleSuggest({ flow });
  },
  { immediate: true, flush: "post" },
);

</script>

<template>
  <div class="relative flex h-full w-full flex-col overflow-hidden bg-sf-primary py-3 select-text">
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
          :change-state="getMessageChanges(msg)"
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
      @send="handleSend"
      @stop="stopGenerating"
    />

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
          :active-chat-id="chat?.id || ''"
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
