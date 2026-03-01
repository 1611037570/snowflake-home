<script setup>
defineProps({
  title: {
    type: String,
    default: '教育经历',
  },
})
</script>

<template>
  <div
    v-if="title"
    class="mb-3 flex items-center pb-2"
    style="border-bottom: 0.1px solid rgba(0, 0, 0, 0.1)"
  >
    <div class="mr-3 h-4 w-1 rounded-full bg-sf-theme"></div>
    <h2 class="text-xl font-bold tracking-wide">{{ title }}</h2>
  </div>
</template>

<style lang="scss" scoped></style>
