<script setup>
import { onMounted, ref } from "vue";
import JdInput from "./JdInput.vue";
import { useAiStore, useResumeStore } from "@/stores";
import { DEFAULT_EDITOR } from "@/stores/modules/resume/defaultConfig";
import { storeToRefs } from "pinia";
import Chat from "./chat/index.vue";
import { defaultMessage } from "./prompt.ts";

// AI 对话
const aiStore = useAiStore();
const resumeStore = useResumeStore();
const { createDefaultChat } = aiStore;
const { resumeAssistantChat } = storeToRefs(aiStore);
const { system } = storeToRefs(resumeStore);
// AI助手区域宽度：读取编辑器配置，默认 400px
const assistantWidth = DEFAULT_EDITOR.assistantWidth;

// 简历助手对话：优先用 Pinia 持久化缓存，首次进入时初始化默认对话
if (!resumeAssistantChat.value) {
  resumeAssistantChat.value = createDefaultChat(defaultMessage);
}
const chat = resumeAssistantChat;

// 挂载时清空持久化对话，每次进入都是新对话
onMounted(() => {
  resumeAssistantChat.value = createDefaultChat(defaultMessage);
});

// 当前视图：score | jd
const currentView = ref("score");

function createNewChat() {
  chat.value = createDefaultChat(defaultMessage);
}

// 请求完成回调，打印数据方便调试
function onRequestComplete(msg) {
  console.log("请求完成数据:>> ", msg);
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
      <Chat :chat="chat" @request-complete="onRequestComplete" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
