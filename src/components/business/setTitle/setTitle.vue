<template>
  <div class="p-3 text-sm font-bold">{{ title }}</div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
})
</script>

<style lang="scss" scoped></style>
