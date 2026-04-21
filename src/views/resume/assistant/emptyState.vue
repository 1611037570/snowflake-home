<script setup>
import { quickActions } from './data'

const emit = defineEmits(['switch-mode'])
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-4 text-center">
    <div class="space-y-2">
      <div class="text-xl font-bold text-sf-base">
        你好，我是 <span class="text-sf-theme">简答羊</span>
      </div>
    </div>
    <div class="text-xs font-medium text-gray-700">我可以帮助你</div>
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
</template>
