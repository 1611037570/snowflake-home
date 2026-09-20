<script setup>
import { computed } from "vue";

// 模特三围数据：对象 { bust, waist, hip }，单位为 cm
const modelValue = defineModel("modelValue", {
  type: Object,
  default: () => ({}),
});

const bust = computed({
  get: () => modelValue.value?.bust,
  set: (value) => {
    modelValue.value = { ...modelValue.value, bust: value };
  },
});

const waist = computed({
  get: () => modelValue.value?.waist,
  set: (value) => {
    modelValue.value = { ...modelValue.value, waist: value };
  },
});

const hip = computed({
  get: () => modelValue.value?.hip,
  set: (value) => {
    modelValue.value = { ...modelValue.value, hip: value };
  },
});

// 三围使用固定厘米选项，同时允许输入特殊数值
const measurementOptions = Array.from({ length: 101 }, (_, index) => {
  const value = String(index + 50);
  return { name: value, value };
});
</script>

<template>
  <div class="flex w-full flex-col gap-3">
    <label class="flex items-center gap-1">
      <span class="text-sm text-sf-text-3">胸围</span>
      <div class="flex-1">
        <SfSelect
          v-model="bust"
          :list="measurementOptions"
          filterable
          allow-create
          default-first-option
          placeholder="选择或输入胸围"
          class="w-full"
        />
      </div>
      <span class="shrink-0 text-xs text-sf-text-2">cm</span>
    </label>
    <label class="flex items-center gap-1">
      <span class="text-sm text-sf-text-3">腰围</span>
      <div class="flex-1">
        <SfSelect
          v-model="waist"
          :list="measurementOptions"
          filterable
          allow-create
          default-first-option
          placeholder="选择或输入腰围"
          class="w-full"
        />
      </div>
      <span class="shrink-0 text-xs text-sf-text-2">cm</span>
    </label>
    <label class="flex items-center gap-1">
      <span class="text-sm text-sf-text-3">臀围</span>
      <div class="flex-1">
        <SfSelect
          v-model="hip"
          :list="measurementOptions"
          filterable
          allow-create
          default-first-option
          placeholder="选择或输入臀围"
          class="w-full"
        />
      </div>
      <span class="shrink-0 text-xs text-sf-text-2">cm</span>
    </label>
  </div>
</template>

<style lang="scss" scoped></style>
