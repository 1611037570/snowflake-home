<script setup>
import { useDraggable, useFps, useMemory } from '@vueuse/core'
import { useTemplateRef } from 'vue'

const fps = useFps({ interval: 500 })
const { memory, isSupported } = useMemory({ interval: 1000 })
const usedMB = computed(() => {
  const m = memory.value
  if (!m) return 0
  return m.usedJSHeapSize / 1024 / 1024
})
const remainingMB = computed(() => {
  const m = memory.value
  if (!m) return 0
  const remaining = (m.jsHeapSizeLimit - m.usedJSHeapSize) / 1024 / 1024
  return remaining
})
const monitor = useTemplateRef('monitor')
const { style } = useDraggable(monitor, { initialValue: { x: 40, y: 40 } })
</script>

<template>
  <div
    :style="style"
    class="fixed top-0 right-0 z-9999 flex w-48 flex-col gap-3 rounded-xl bg-sf-theme p-3 text-sf-theme-text shadow-xl"
    ref="monitor"
  >
    <div>
      fps：<span :class="fps >= 30 ? '' : 'text-sf-error'">{{ fps }}</span>
    </div>
    <template v-if="isSupported && memory">
      <div class="flex">
        已用内存：<span :class="usedMB < 300 ? '' : 'text-sf-warning'">
          {{ usedMB.toFixed(2) }} </span
        >MB
      </div>
      <div class="flex">
        剩余内存：
        <span :class="remainingMB >= 0 ? '' : 'text-sf-error'">
          {{ remainingMB.toFixed(2) }}MB
        </span>
      </div>
    </template>
  </div>
</template>
