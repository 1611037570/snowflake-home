<script setup>
defineProps({
  title: {
    type: String,
    default: '教育经历',
  },
})
const fontValue = inject('fontValue')
const lineHeightValue = inject('lineHeightValue')
const themeColor = inject('themeColor')
</script>

<template>
  <div
    v-if="title"
    class="flex items-center pb-2"
    style="border-bottom: 0.1px solid rgba(0, 0, 0, 0.1)"
  >
    <div class="mr-3 h-4 w-1 rounded-full bg-sf-theme" :style="{ background: themeColor }"></div>
    <h2 class="font-bold tracking-wide" :style="[fontValue(5), lineHeightValue(5)]">{{ title }}</h2>
  </div>
</template>

<style lang="scss" scoped></style>
