<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed, provide } from 'vue'
import ResumePage from './page.vue'
import ScaleContainer from './ScaleContainer.vue'

const resumeStore = useResumeStore()
const { currentUI } = storeToRefs(resumeStore)

const paddingValue = computed(() => (offset = 0) => ({
  padding: `${currentUI.value.padding + offset}px`,
}))
const fontValue = computed(() => (offset = 0) => ({
  fontSize: `${currentUI.value.fontSize + offset}px`,
}))
const lineHeightValue = computed(() => (offset = 0) => ({
  lineHeight: `${currentUI.value.lineHeight + offset}px`,
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
