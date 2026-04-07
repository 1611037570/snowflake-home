<template>
  <div class="flex items-center text-lg font-bold">
    {{ name }}
  </div>
</template>

<script setup>
defineOptions({
  name: 'SfTitle',
})
const name = defineModel('modelValue', {
  default: '',
})
</script>

<style scoped></style>
