<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
});

const modelValue = defineModel({
  type: Number,
});
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <div class="mb-2 text-base font-bold text-sf-text">{{ label }}</div>
    <!-- 左侧进度条拖拽，右侧输入框，数值限制在 2-100 -->
    <div class="flex items-center gap-3">
      <SfSlider v-model="modelValue" :min="2" :max="100" class="flex-1" />
      <SfInputNumber v-model="modelValue" :min="2" :max="100" class="w-20 flex-shrink-0" />
    </div>
  </div>
</template>

<style scoped></style>
