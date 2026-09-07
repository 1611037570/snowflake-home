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
    modelValue.value = { ...(modelValue.value || {}), height: value };
  },
});

// 体重：单独读写对象中的 weight 字段
const weight = computed({
  get: () => modelValue.value?.weight,
  set: (value) => {
    modelValue.value = { ...(modelValue.value || {}), weight: value };
  },
});
</script>

<template>
  <div class="flex w-full items-center gap-3">
    <!-- 身高数值输入 -->
    <div class="min-w-0 flex-1">
      <SfInputNumber v-model="height" :min="1" :max="300" placeholder="身高" class="w-full" />
    </div>
    <span class="shrink-0 text-sm text-sf-text-2">cm</span>
    <!-- 体重数值输入 -->
    <div class="min-w-0 flex-1">
      <SfInputNumber v-model="weight" :min="1" :max="500" placeholder="体重" class="w-full" />
    </div>
    <span class="shrink-0 text-sm text-sf-text-2">kg</span>
  </div>
</template>

<style lang="scss" scoped></style>
