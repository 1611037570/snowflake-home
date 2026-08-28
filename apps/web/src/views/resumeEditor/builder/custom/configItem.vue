<script setup>
import { computed, watch } from "vue";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  min: {
    type: Number,
    default: 2,
  },
  max: {
    type: Number,
    default: 100,
  },
  step: {
    type: Number,
    default: 1,
  },
});

const modelValue = defineModel({
  type: Number,
});

// 统一转为数值，避免字符串参与滑块内部计算导致 toFixed 等异常
const sliderMin = Number(props.min);
const sliderMax = Number(props.max);
const sliderStep = Number(props.step);

// 统一钳制滑块和输入框的值，避免越界值更新到外层状态
const clampValue = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return sliderMin;
  return Math.min(sliderMax, Math.max(sliderMin, value));
};

const currentValue = computed({
  get: () => clampValue(modelValue.value),
  set: (value) => {
    modelValue.value = clampValue(value);
  },
});

watch(
  modelValue,
  (value) => {
    const clampedValue = clampValue(value);
    if (value !== clampedValue) modelValue.value = clampedValue;
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <div class="mb-2 text-base font-bold text-sf-text">{{ label }}</div>
    <!-- 左侧进度条拖拽，右侧输入框，范围与步进跟随 min/max/step 配置 -->
    <div class="flex items-center gap-3">
      <SfSlider
        v-model="currentValue"
        :min="sliderMin"
        :max="sliderMax"
        :step="sliderStep"
        class="flex-1"
      />
      <SfInputNumber
        v-model="currentValue"
        :min="sliderMin"
        :max="sliderMax"
        :step="sliderStep"
        class="w-20 flex-shrink-0"
      />
    </div>
  </div>
</template>

<style scoped></style>
