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

const topSizeOptions = [
  { name: "155/80A", value: "155/80A" },
  { name: "160/84A", value: "160/84A" },
  { name: "165/88A", value: "165/88A" },
  { name: "170/92A", value: "170/92A" },
  { name: "175/96A", value: "175/96A" },
  { name: "180/100A", value: "180/100A" },
  { name: "185/104A", value: "185/104A" },
];

// 下装使用带 W 前缀的腰围尺码
const bottomSizeOptions = Array.from({ length: 31 }, (_, index) => {
  const value = `W${index + 10}`;
  return { name: value, value };
});
</script>

<template>
  <div class="flex w-full flex-col gap-3">
    <label class="flex items-center gap-1">
      <span class="text-sm text-sf-text-3">上装</span>
      <SfSelect v-model="top" :list="topSizeOptions" placeholder="选择尺码" class="w-full" />
    </label>
    <label class="flex items-center gap-1">
      <span class="text-sm text-sf-text-3">下装</span>
      <SfSelect v-model="bottom" :list="bottomSizeOptions" placeholder="选择尺码" class="w-full" />
    </label>
    <label class="flex items-center gap-1">
      <span class="text-sm text-sf-text-3">鞋码</span>
      <div class="flex-1">
        <SfInput v-model="shoes" placeholder="如 42" class="w-full">
          <template #suffix>
            <span class="text-xs text-sf-text-3">码</span>
          </template>
        </SfInput>
      </div>
    </label>
  </div>
</template>

<style lang="scss" scoped></style>
