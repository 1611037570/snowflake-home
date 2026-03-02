<script setup>
defineProps({
  title: {
    type: String,
  },
})
</script>

<template>
  <div class="my-4 text-lg font-bold">{{ title }}</div>
</template>

<style lang="scss" scoped></style>
