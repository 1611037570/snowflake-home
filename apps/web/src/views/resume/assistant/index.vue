<script setup>
import { ref } from "vue";
import { quickActions } from "./data";
import EmptyState from "./emptyState.vue";
import JdInput from "./JdInput.vue";
import Score from "./Score.vue";
import { useAiStore } from "@/stores/modules/ai";
import Chat from "@/views/ai/chat/index.vue";

// AI 对话
const aiStore = useAiStore();
const { createDefaultChat } = aiStore;

// 默认对话
const chat = ref([]);

// 当前视图：score | jd
const currentView = ref("score");
const activeMode = ref("");

function switchMode(type) {
  const action = quickActions.find((item) => item.type === type);
  chat.value = createDefaultChat();
  activeMode.value = action?.name || "";
  currentView.value = type;
}

function clearChat() {
  activeMode.value = "";
}
</script>

<template>
  <div class="box-border h-full w-[360px] bg-sf-bg py-3 pr-3">
    <div class="flex h-full flex-col rounded-xl border border-sf-border/40 bg-sf-primary shadow-sm">
      <div class="flex-1 overflow-y-auto">
        <EmptyState v-if="!activeMode" @switch-mode="switchMode" />
        <Score v-else-if="currentView === 'score'" />
        <JdInput v-else-if="currentView === 'jd'" />
      </div>
      <!-- AI 对话项 -->
      <div class="cursor-pointer" @click="clearChat">清空对话</div>
      <Chat :chat="chat" v-if="activeMode" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
