<script setup>
import { quickActions } from './data'

const emit = defineEmits(['switch-mode'])
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-4 text-center">
    <div>
      <div class="text-base font-semibold text-gray-700">选择一个 AI 操作</div>
      <div class="mt-1 text-xs text-gray-500">先选择要处理的简历任务，再继续输入内容。</div>
    </div>
    <div class="grid w-full grid-cols-2 gap-2">
      <button
        v-for="action in quickActions"
        :key="action.name"
        type="button"
        class="flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-gray-100 py-2 text-xs font-medium text-gray-700 transition-all active:scale-[0.98]"
        @click="emit('switch-mode', action.type)"
      >
        <SfIcon :icon="action.icon" :size="3" />
        {{ action.name }}
      </button>
    </div>
  </div>
</template>
