<script setup>
import { computed } from "vue";

// 尺码数据：对象 { top, bottom, shoes }
const modelValue = defineModel("modelValue", {
  type: Object,
  default: () => ({}),
});

const top = computed({
  get: () => modelValue.value?.top,
  set: (value) => {
    modelValue.value = { ...modelValue.value, top: value };
  },
});

const bottom = computed({
  get: () => modelValue.value?.bottom,
  set: (value) => {
    modelValue.value = { ...modelValue.value, bottom: value };
  },
});

const shoes = computed({
  get: () => modelValue.value?.shoes,
  set: (value) => {
    modelValue.value = { ...modelValue.value, shoes: value };
  },
});
</script>

<template>
  <div class="grid w-full grid-cols-3 gap-3">
    <label class="min-w-0">
      <span class="mb-1 block text-xs text-sf-text-3">上装</span>
      <SfInput v-model="top" placeholder="上装" class="w-full" />
    </label>
    <label class="min-w-0">
      <span class="mb-1 block text-xs text-sf-text-3">下装</span>
      <SfInput v-model="bottom" placeholder="下装" class="w-full" />
    </label>
    <label class="min-w-0">
      <span class="mb-1 block text-xs text-sf-text-3">鞋码</span>
      <SfInput v-model="shoes" placeholder="鞋码" class="w-full" />
    </label>
  </div>
</template>

<style lang="scss" scoped></style>
