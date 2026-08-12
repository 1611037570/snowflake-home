<script setup>
import { computed } from "vue";
import AiMessage from "./aiMessage.vue";
import UserMessage from "./userMessage.vue";

const props = defineProps({
  messages: {
    type: Array,
    required: true,
  },
});

// 过滤掉 system 消息后的显示列表
const displayMessages = computed(() => {
  return props.messages.filter((m) => m.role !== "system");
});

const emit = defineEmits(["recall"]);
</script>

<template>
  <div class="flex h-full flex-col items-center p-3">
    <component
      :is="msg.role === 'user' ? UserMessage : AiMessage"
      v-for="(msg, index) in displayMessages"
      :key="index"
      :msg="msg"
      :index="index"
      :is-last-few="index >= displayMessages.length - 2"
      @recall="emit('recall', msg)"
      @toggle-thought="msg.thoughtCollapsed = !msg.thoughtCollapsed"
      @toggle-collapsed="msg.collapsed = !msg.collapsed"
    />
  </div>
</template>

<style scoped></style>
