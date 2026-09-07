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
  <div class="p-3">
    <div
      class="flex h-[36px] w-full justify-between rounded-3xl border border-sf-b bg-sf-page p-1.5"
    >
      <div class="flex items-center gap-1">
        <MessageNav
          v-if="props.messages.length"
          :messages="props.messages"
          @select="emit('select', $event)"
        />
        <SfTooltip content="新建话题">
          <SfIcon
            @click="createNewChat"
            icon="ph:plus-bold"
            size="4"
            boxSize="6"
            class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
          />
        </SfTooltip>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
