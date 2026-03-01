<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  max: {
    type: Number,
    default: 2,
  },
  leftLabel: {
    type: String,
    default: '小',
  },
  rightLabel: {
    type: String,
    default: '大',
  },
})

const modelValue = defineModel()
</script>

<template>
  <div class="flex w-full flex-col gap-2 text-sf-primary">
    <div class="text-xs font-bold opacity-60">{{ label }}</div>
    <SfSlider :show-tooltip="false" show-stops :max="max" v-model="modelValue" />
    <div class="flex items-center justify-between text-xs opacity-60">
      <div>{{ leftLabel }}</div>
      <div>{{ rightLabel }}</div>
    </div>
  </div>
</template>

<style scoped></style>
