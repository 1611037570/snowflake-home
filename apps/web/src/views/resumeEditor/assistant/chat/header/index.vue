<script setup>
import { useAiStore } from "@/stores";
import MessageNav from "./messageNav.vue";

const props = defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(["select"]);

const aiStore = useAiStore();

function createNewChat() {
  aiStore.createNewResumeAssistantChat();
}
</script>

<template>
  <div class="px-3 pt-3">
    <div class="flex w-full justify-between">
      <div>
        <MessageNav
          v-if="props.messages.length"
          :messages="props.messages"
          @select="emit('select', $event)"
        />
      </div>
      <div class="flex items-center gap-1">
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
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
