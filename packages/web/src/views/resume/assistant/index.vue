<script setup>
import { ref } from "vue";
import { quickActions } from "./data";
import EmptyState from "./emptyState.vue";
import InputArea from "./InputArea.vue";
import JdInput from "./JdInput.vue";
import Score from "./Score.vue";
import { useAiStore } from "@/stores/modules/ai";
import ChatItem from "@/views/ai/chatlist/chatItem.vue";

// AI 对话
const aiStore = useAiStore();
const chat = aiStore.createChat();

// 当前视图：score | jd
const currentView = ref("score");
const activeMode = ref("");

// 切换到 JD 对标视图
function switchToJd() {
  currentView.value = "jd";
}

function switchMode(type) {
  const action = quickActions.find((item) => item.type === type);
  activeMode.value = action?.name || "";
  currentView.value = type;
}
</script>

<template>
  <div class="box-border h-full w-[360px] bg-sf-bg py-3 pr-3">
    <div
      class="flex h-full flex-col rounded-xl border border-sf-border/40 bg-sf-primary p-3 shadow-sm"
    >
      <div class="flex-1 overflow-y-auto">
        <EmptyState v-if="!activeMode" @switch-mode="switchMode" />
        <Score v-else-if="currentView === 'score'" />
        <JdInput v-else-if="currentView === 'jd'" />
      </div>

      <!-- AI 对话项 -->
      <ChatItem :chat="chat" />

      <!-- 下方：输入框组件 -->
      <InputArea
        v-model:active-mode="activeMode"
        @switch-jd="switchToJd"
        @switch-mode="switchMode"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
