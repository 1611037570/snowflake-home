<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { quickActions } from './data'

const emit = defineEmits(['switch-mode'])
const resumeStore = useResumeStore()
const { currentConfig, currentFixedConfig, selectedModuleKeys } = storeToRefs(resumeStore)

const moduleNames = computed(() => {
  const moduleMap = [
    ...(currentFixedConfig.value?.fields || []),
    ...(currentConfig.value?.fields || []),
  ].reduce((map, item) => {
    if (item.key) {
      map[item.key] = item.name
    }
    return map
  }, {})
  const moduleNames = Array.from(selectedModuleKeys.value).map((key) => moduleMap[key] || key)
  if (moduleNames.length) {
    return moduleNames
  }
  return ['整个简历']
})
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-4 text-center">
    <div class="space-y-2">
      <div class="text-2xl font-bold text-sf-base">
        你好，我是 <span class="text-sf-theme">简答羊</span>
      </div>
    </div>
    <div class="flex items-center justify-center gap-2 text-base font-medium text-sf-base">
      我可以帮助你根据
      <div
        v-for="item in moduleNames"
        :key="item"
        class="rounded-xl bg-sf-theme p-1 text-sf-primary"
      >
        {{ item }}
      </div>
      优化
    </div>
    <div class="mt-2 grid grid-cols-2 gap-2">
      <div
        v-for="action in quickActions"
        :key="action.name"
        type="button"
        class="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-transparent bg-white p-2 py-2 text-base font-medium text-sf-base shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sf-theme hover:text-sf-theme hover:shadow-md active:scale-95 active:shadow-sm"
        @click="emit('switch-mode', action.type)"
      >
        <SfIcon :icon="action.icon" :size="3" />
        {{ action.name }}
      </div>
    </div>
  </div>
</template>
