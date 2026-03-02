<script setup>
import { useResumeStore } from '@/stores'
import { fontList, lineHeightList, paddingList } from '@/stores/modules/resume/uiConfig'
import { storeToRefs } from 'pinia'
import { computed, provide } from 'vue'
import ResumePage from './page.vue'
import ScaleContainer from './ScaleContainer.vue'

const resumeStore = useResumeStore()
const { currentUI } = storeToRefs(resumeStore)

const paddingValue = computed(() => (offset = 0) => ({
  padding: `${paddingList[currentUI.value.paddingIndex].value + offset}px`,
}))
const fontValue = computed(() => (offset = 0) => ({
  fontSize: `${fontList[currentUI.value.fontIndex].value + offset}px`,
}))
const lineHeightValue = computed(() => (offset = 0) => ({
  lineHeight: `${lineHeightList[currentUI.value.lineHeightIndex].value + offset}px`,
}))

provide('paddingValue', paddingValue)
provide('fontValue', fontValue)
provide('lineHeightValue', lineHeightValue)
</script>

<template>
  <div class="flex h-full flex-col">
    <ScaleContainer class="min-h-0 w-full flex-1">
      <ResumePage />
    </ScaleContainer>
  </div>
</template>

<style scoped></style>
