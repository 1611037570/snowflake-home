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
  return {
    lineHeight: `${currentUI.value.lineHeight + offset + indexOffset}px`,
  }
})
const themeColor = computed(() => currentUI.value.themeColor)
const themeStyle = computed(() => currentUI.value.themeStyle)
provide('paddingValue', paddingValue)
provide('fontValue', fontValue)
provide('lineHeightValue', lineHeightValue)
provide('themeColor', themeColor)
provide('themeStyle', themeStyle)
</script>

<template>
  <div class="scrollbar-hide flex h-full flex-1 flex-col items-center overflow-y-auto pt-3">
    <ScaleContainer>
      <ResumePage />
    </ScaleContainer>
  </div>
</template>

<style scoped></style>
