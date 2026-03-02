<script setup>
import { useResumeStore } from '@/stores'
import { themeColors } from '@/stores/modules/resume/uiConfig'
const resumeStore = useResumeStore()
const { currentUI } = storeToRefs(resumeStore)
defineProps({
  title: {
    type: String,
    default: '教育经历',
  },
})
const fontValue = inject('fontValue')
const themeColor = computed(() => themeColors[currentUI.value.colorIndex]?.value)
</script>

<template>
  <div
    v-if="title"
    class="mb-3 flex items-center pb-2"
    style="border-bottom: 0.1px solid rgba(0, 0, 0, 0.1)"
  >
    <div class="mr-3 h-4 w-1 rounded-full bg-sf-theme" :style="{ background: themeColor }"></div>
    <h2 class="font-bold tracking-wide" :style="[fontValue(5)]">{{ title }}</h2>
  </div>
</template>

<style lang="scss" scoped></style>
