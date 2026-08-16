<script setup>
import { computed } from "vue";
import AiMessage from "./aiMessage.vue";
import UserMessage from "./userMessage.vue";

const messages = defineModel("messages");
// 过滤掉 system 消息后的显示列表
const displayMessages = computed(() => {
  return messages.value.filter((m) => m.role !== "system");
});

const emit = defineEmits(["recall", "sendFollowQuestion"]);

function updateCollapsedStatus(index, type) {
  displayMessages.value[index][`${type}Collapsed`] =
    !displayMessages.value[index][`${type}Collapsed`];
}
</script>

<template>
  <div class="flex h-full flex-col items-center p-3">
    <component
      :is="msg.role === 'user' ? UserMessage : AiMessage"
      v-for="(msg, index) in displayMessages"
      :key="index"
      :msg="msg"
      :index="index"
      @recall="emit('recall', msg)"
      @updateCollapsedStatus="updateCollapsedStatus"
      @sendFollowQuestion="emit('sendFollowQuestion', $event)"
    />
  </div>
</template>

<style scoped></style>
