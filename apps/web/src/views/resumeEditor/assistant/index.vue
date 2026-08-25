<script setup>
import { ref } from "vue";
import { quickActions } from "./data";
import EmptyState from "./emptyState.vue";
import JdInput from "./JdInput.vue";
import Score from "./Score.vue";
import Setting from "./setting/index.vue";
import { useAiStore } from "@/stores/modules/ai";
import Chat from "./chat/index.vue";
import { defaultMessage } from "./prompt.ts";

// AI 对话
const aiStore = useAiStore();
const { createDefaultChat } = aiStore;

// 默认对话
const chat = ref(createDefaultChat(defaultMessage));

// 当前视图：score | jd
const currentView = ref("score");
const activeMode = ref("");

function switchMode(type) {
  const action = quickActions.find((item) => item.type === type);
  chat.value = createDefaultChat(defaultMessage);
  activeMode.value = action?.name || "";
  currentView.value = type;
}

// 请求完成回调，打印数据方便调试
function onRequestComplete(msg) {
  console.log("请求完成数据:>> ", msg);
}
</script>

<template>
  <div class="box-border h-full w-[400px] py-3 pr-3">
    <div class="relative flex h-full flex-col rounded-xl border border-sf-b bg-sf-primary">
      <!-- 顶部操作栏 -->
      <div class="flex items-center justify-end gap-2 p-3 pb-0">
        <Setting />
      </div>
      <div class="flex-1 overflow-y-auto">
        <Score v-if="currentView === 'score'" />
        <JdInput v-else-if="currentView === 'jd'" />
      </div>
      <Chat :chat="chat" type="resume" @request-complete="onRequestComplete">
        <template #empty>
          <EmptyState @switch-mode="switchMode" />
        </template>
      </Chat>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
