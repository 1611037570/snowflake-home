<script setup>
import { ref } from "vue";
import JdInput from "./JdInput.vue";
import Score from "./Score.vue";
import { useAiStore, useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import Chat from "./chat/index.vue";
import { defaultMessage } from "./prompt.ts";

// AI 对话
const aiStore = useAiStore();
const resumeStore = useResumeStore();
const { createDefaultChat } = aiStore;
const { system } = storeToRefs(resumeStore);

// 默认对话
const chat = ref(createDefaultChat(defaultMessage));

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
  <div class="box-border h-full w-[400px] py-3">
    <div
      class="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-sf-b bg-sf-primary"
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
      <div class="flex-1 overflow-y-auto">
        <Score v-if="currentView === 'score'" />
        <JdInput v-else-if="currentView === 'jd'" />
      </div>
      <Chat :chat="chat" @request-complete="onRequestComplete" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
