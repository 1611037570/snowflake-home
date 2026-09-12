<script setup lang="ts">
import type { Chat } from "@/stores/modules/ai";

defineProps<{
  chats: Chat[];
  activeChatId: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  select: [id: string];
  create: [];
}>();

function formatTime(time: number) {
  return new Date(time).toLocaleString();
}
</script>

<template>
  <aside class="border-sf-border flex min-h-0 w-72 shrink-0 flex-col border-r bg-sf-primary">
    <div class="flex shrink-0 items-center justify-between gap-3 p-3">
      <h2 class="font-bold text-sf-text">对话记录</h2>
      <SfTooltip content="新建话题">
        <button
          class="flex cursor-pointer items-center justify-center rounded-lg bg-sf-theme p-3 text-sf-theme-text transition hover:bg-sf-theme-2 disabled:cursor-not-allowed disabled:bg-sf-bg-3 disabled:text-sf-text-2"
          type="button"
          :disabled="disabled"
          @click="emit('create')"
        >
          <SfIcon icon="ph:plus-bold" size="4" />
        </button>
      </SfTooltip>
    </div>

    <SfScrollbar class="min-h-0 flex-1 px-3 pb-3">
      <div class="space-y-3">
        <button
          v-for="chat in chats"
          :key="chat.id"
          class="border-sf-border w-full cursor-pointer rounded-lg border p-3 text-left transition hover:bg-sf-bg-2 disabled:cursor-not-allowed"
          :class="chat.id === activeChatId ? 'border-sf-theme bg-sf-bg-2' : ''"
          type="button"
          :disabled="disabled"
          @click="emit('select', chat.id)"
        >
          <div class="truncate font-medium text-sf-text">{{ chat.title }}</div>
          <div class="mt-3 text-sm text-sf-text-2">{{ formatTime(chat.updateTime) }}</div>
        </button>
      </div>
    </SfScrollbar>
  </aside>
</template>
