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
</script>

<template>
  <div class="flex w-full flex-col gap-3">
    <div class="grid w-full grid-cols-3 gap-3">
      <label class="min-w-0">
        <span class="mb-1 block text-xs text-sf-text-3">胸围</span>
        <div class="flex min-w-0 items-center gap-1">
          <SfInput v-model="bust" inputmode="decimal" placeholder="胸围" class="min-w-0 flex-1" />
          <span class="shrink-0 text-xs text-sf-text-2">cm</span>
        </div>
      </label>
      <label class="min-w-0">
        <span class="mb-1 block text-xs text-sf-text-3">腰围</span>
        <div class="flex min-w-0 items-center gap-1">
          <SfInput v-model="waist" inputmode="decimal" placeholder="腰围" class="min-w-0 flex-1" />
          <span class="shrink-0 text-xs text-sf-text-2">cm</span>
        </div>
      </label>
      <label class="min-w-0">
        <span class="mb-1 block text-xs text-sf-text-3">臀围</span>
        <div class="flex min-w-0 items-center gap-1">
          <SfInput v-model="hip" inputmode="decimal" placeholder="臀围" class="min-w-0 flex-1" />
          <span class="shrink-0 text-xs text-sf-text-2">cm</span>
        </div>
      </label>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
