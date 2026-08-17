<script setup>
import { computed } from "vue";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  list: {
    type: Array,
    required: true,
  },
  leftLabel: {
    type: String,
    default: "小",
  },
  rightLabel: {
    type: String,
    default: "大",
  },
});

const modelValue = defineModel();

const currentIndex = computed({
  get() {
    return props.list.findIndex((item) => item.value === modelValue.value);
  },
  set(index) {
    modelValue.value = props.list[index].value;
  },
});
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <div class="mb-2 text-base font-bold text-sf-text">{{ label }}</div>
    <SfSlider :show-tooltip="false" show-stops :max="list.length - 1" v-model="currentIndex" />
    <div class="mt-2 flex items-center justify-between text-xs opacity-60">
      <div>{{ leftLabel }}</div>
      <div>{{ rightLabel }}</div>
    </div>
  </div>
</template>

<style scoped></style>
