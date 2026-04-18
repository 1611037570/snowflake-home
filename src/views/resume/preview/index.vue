<script setup>
import { useResumeStore } from '@/stores'
import { fontSizeList } from '@/stores/modules/resume/uiConfig'
import { storeToRefs } from 'pinia'
import { computed, provide } from 'vue'
import ResumePage from './page.vue'
import ScaleContainer from './ScaleContainer.vue'

const resumeStore = useResumeStore()
const { currentUI } = storeToRefs(resumeStore)

const paddingValue = computed(() => (offset = 0) => ({
  padding: `${currentUI.value.padding + offset}px`,
}))
const fontSize = computed(() => {
  return currentUI.value.fontSize
})
const fontSizeIndex = computed(() => {
  return fontSizeList.findIndex((item) => item.value === fontSize.value)
})
const fontValue = computed(() => (offset = 0) => ({
  fontSize: `${currentUI.value.fontSize + offset}px`,
}))
//
const lineHeightValue = computed(() => (offset = 0) => {
  const indexOffset = (fontSizeIndex.value - 2) * 3
  console.log('indexOffset', indexOffset)
  return {
    lineHeight: `${currentUI.value.lineHeight + offset + indexOffset}px`,
  }
})

provide('paddingValue', paddingValue)
provide('fontValue', fontValue)
provide('lineHeightValue', lineHeightValue)
</script>

<template>
  <div
    class="bg-sf-bg-soft scrollbar-hide flex h-full flex-col items-center overflow-hidden overflow-y-auto"
  >
    <ScaleContainer class="min-h-0 w-full flex-1">
      <ResumePage />
    </ScaleContainer>
  </div>
</template>

<style scoped></style>
