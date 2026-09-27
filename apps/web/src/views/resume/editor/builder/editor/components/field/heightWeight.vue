<script setup>
import { computed } from "vue";

// 身高体重数据：对象 { height, weight }，height 单位 cm，weight 单位 kg
const modelValue = defineModel("modelValue", {
  type: Object,
  default: () => ({}),
});

// 身高：单独读写对象中的 height 字段
const height = computed({
  get: () => modelValue.value?.height,
  set: (value) => {
    modelValue.value = { ...modelValue.value, height: value };
  },
});

// 体重：单独读写对象中的 weight 字段
const weight = computed({
  get: () => modelValue.value?.weight,
  set: (value) => {
    modelValue.value = { ...modelValue.value, weight: value };
  },
});

// 身高体重提供常用范围，同时允许输入特殊数值
const heightOptions = Array.from({ length: 81 }, (_, index) => {
  const value = String(index + 140);
  return { name: value, value };
});

const weightOptions = Array.from({ length: 121 }, (_, index) => {
  const value = String(index + 30);
  return { name: value, value };
});
</script>

<template>
  <div class="flex w-full flex-col gap-3">
    <label class="flex items-center gap-1">
      <span class="text-sm text-sf-text-3">{{ $t("height") }}</span>
      <div class="flex-1">
        <SfSelect
          v-model="height"
          :list="heightOptions"
          filterable
          allow-create
          default-first-option
          clearable
          :placeholder="$t('heightPlaceholder')"
          class="w-full"
        />
      </div>
      <span class="shrink-0 text-sm text-sf-text-2">cm</span>
    </label>
    <label class="flex items-center gap-1">
      <span class="text-sm text-sf-text-3">{{ $t("weight") }}</span>
      <div class="flex-1">
        <SfSelect
          v-model="weight"
          :list="weightOptions"
          filterable
          allow-create
          default-first-option
          clearable
          :placeholder="$t('weightPlaceholder')"
          class="w-full"
        />
      </div>
      <span class="shrink-0 text-sm text-sf-text-2">kg</span>
    </label>
  </div>
</template>

<style lang="scss" scoped></style>
