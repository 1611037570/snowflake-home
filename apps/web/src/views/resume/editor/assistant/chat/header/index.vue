<script setup>
import { useAiStore } from "@/stores";
import MessageNav from "./messageNav.vue";

const props = defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
  isGenerating: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["select", "openChatList"]);

const aiStore = useAiStore();

function createNewChat() {
  if (props.isGenerating) return;
  aiStore.createNewResumeAssistantChat();
}
</script>

<template>
  <div class="px-3">
    <div class="flex w-full justify-between">
      <div class="flex items-center gap-3">
        <MessageNav
          v-if="props.messages.length"
          :messages="props.messages"
          @select="emit('select', $event)"
        />
      </div>
      <div class="flex items-center gap-1">
        <SfTooltip content="对话记录">
          <SfIcon
            @click="emit('openChatList')"
            icon="ph:chats-teardrop-duotone"
            size="5"
            boxSize="7"
            class="cursor-pointer rounded-full text-sf-text-2 hover:bg-sf-bg-2 hover:text-sf-text"
          />
        </SfTooltip>
        <SfTooltip content="新建话题" v-if="props.messages.length">
          <SfIcon
            @click="createNewChat"
            icon="ph:plus-bold"
            size="5"
            boxSize="7"
            class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
            :class="{ 'cursor-not-allowed opacity-50': props.isGenerating }"
          />
        </SfTooltip>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
