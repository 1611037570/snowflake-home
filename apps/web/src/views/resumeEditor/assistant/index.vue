<script setup>
import { inject, onMounted, ref } from "vue";
import { useAiStore, useResumeStore } from "@/stores";
import { DEFAULT_EDITOR } from "@/stores/modules/resume/defaultConfig";
import { storeToRefs } from "pinia";
import Chat from "./chat/index.vue";
import { defaultMessage } from "./prompt.ts";
import { useResumeAssistantConfig } from "./useResumeAssistantConfig";

// AI 对话
const aiStore = useAiStore();
const resumeStore = useResumeStore();
// 应用 AI 差异由上层预览草稿注入，随技能与工具一并传给 chat
const applyDiff = inject("applyDiff");
// 组装简历域技能与工具，由调用方传给 chat 引擎
const assistantConfig = useResumeAssistantConfig(applyDiff);
const { createDefaultChat, createDefaultMessage } = aiStore;
const { resumeAssistantChat } = storeToRefs(aiStore);
const { system } = storeToRefs(resumeStore);
// AI助手区域宽度：读取编辑器配置，默认 400px
const assistantWidth = DEFAULT_EDITOR.assistantWidth;

// 创建对话：默认系统提示在前，简历数据技能全文作为第二条系统消息
const createAssistantChat = () => {
  const newChat = createDefaultChat(defaultMessage);
  if (assistantConfig.skillSystem) {
    newChat.messages.push({
      ...createDefaultMessage(),
      role: "system",
      content: assistantConfig.skillSystem,
      typing: false,
    });
  }
  return newChat;
};

// 简历助手对话：优先用 Pinia 持久化缓存，首次进入时初始化默认对话
if (!resumeAssistantChat.value) {
  resumeAssistantChat.value = createAssistantChat();
}
const chat = resumeAssistantChat;

// 挂载时清空持久化对话，每次进入都是新对话
onMounted(() => {
  resumeAssistantChat.value = createAssistantChat();
});

function createNewChat() {
  chat.value = createAssistantChat();
}
</script>

<template>
  <div class="box-border h-full py-3" :style="{ width: assistantWidth + 'px' }">
    <div
      class="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-sf-b bg-sf-primary hover:border-sf-theme-2"
    >
      <!-- 顶部操作栏 -->
      <div
        class="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full border border-sf-b bg-sf-page p-2 transition-all duration-200 select-none"
        :class="
          system.toolbarAlwaysVisible
            ? 'translate-y-0 opacity-100'
            : '-translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
        "
      >
        <SfTooltip content="新建话题">
          <SfIcon
            @click="createNewChat"
            icon="ph:plus-bold"
            size="5"
            boxSize="7"
            class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
          />
        </SfTooltip>
      </div>
      <Chat :chat="chat" :config="assistantConfig" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
