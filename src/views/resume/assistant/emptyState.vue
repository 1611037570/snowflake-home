<script setup>
import { quickActions } from './data'

const emit = defineEmits(['switch-mode'])
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-4 text-center">
    <div class="space-y-2">
      <div
        class="inline-flex items-center justify-center gap-1.5 rounded-full bg-sf-bg px-3 py-1 text-xs font-medium text-sf-theme"
      >
        <SfIcon icon="ph:magic-wand-duotone" :size="3" />
        简历 AI 助手
      </div>
      <div class="text-xl font-bold text-gray-800">
        你好，我是 <span class="text-sf-theme">简答羊</span>
      </div>
      <div class="text-xs leading-5 text-gray-500">
        围绕当前简历，帮你生成、润色、评分和对标 JD。
      </div>
    </div>
    <div class="w-full rounded-lg bg-sf-bg p-3 text-left">
      <div class="text-xs font-medium text-gray-700">选择任务</div>
      <div class="mt-2 grid grid-cols-2 gap-2">
        <button
          v-for="action in quickActions"
          :key="action.name"
          type="button"
          class="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-transparent bg-white py-2 text-xs font-medium text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sf-theme hover:text-sf-theme hover:shadow-md active:scale-95 active:shadow-sm"
          @click="emit('switch-mode', action.type)"
        >
          <SfIcon :icon="action.icon" :size="3" />
          {{ action.name }}
        </button>
      </div>
    </div>
  </div>
</template>
