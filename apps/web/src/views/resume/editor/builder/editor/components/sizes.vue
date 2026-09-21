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
  { name: "190/108A", value: "190/108A" },
  { name: "195/112A", value: "195/112A" },
  { name: "200/116A", value: "200/116A" },
  { name: "205/120A", value: "205/120A" },
  { name: "210/124A", value: "210/124A" },
];

// 下装使用带 W 前缀的腰围尺码
const bottomSizeOptions = Array.from({ length: 31 }, (_, index) => {
  const value = `W${index + 10}`;
  return { name: value, value };
});

// 鞋码使用固定选项，避免输入格式不统一
const shoesSizeOptions = [
  "35",
  "35.5",
  "36",
  "36.5",
  "37",
  "37.5",
  "38",
  "38.5",
  "39",
  "39.5",
  "40",
  "40.5",
  "41",
  "41.5",
  "42",
  "42.5",
  "43",
  "43.5",
  "44",
  "44.5",
  "45",
  "45.5",
  "46",
].map((value) => ({ name: value, value }));
</script>

<template>
  <div class="flex w-full flex-col gap-3">
    <label class="flex items-center gap-1">
      <span class="text-sm text-sf-text-3">上装</span>
      <SfSelect
        v-model="top"
        :list="topSizeOptions"
        filterable
        allow-create
        default-first-option
        clearable
        placeholder="选择或输入尺码"
        class="w-full"
      />
    </label>
    <label class="flex items-center gap-1">
      <span class="text-sm text-sf-text-3">下装</span>
      <SfSelect
        v-model="bottom"
        :list="bottomSizeOptions"
        filterable
        allow-create
        default-first-option
        clearable
        placeholder="选择或输入尺码"
        class="w-full"
      />
    </label>
    <label class="flex items-center gap-1">
      <span class="text-sm text-sf-text-3">鞋码</span>
      <SfSelect
        v-model="shoes"
        :list="shoesSizeOptions"
        filterable
        allow-create
        default-first-option
        clearable
        placeholder="选择或输入鞋码"
        class="w-full"
      />
    </label>
  </div>
</template>

<style lang="scss" scoped></style>
