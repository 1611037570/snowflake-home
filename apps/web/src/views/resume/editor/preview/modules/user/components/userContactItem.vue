<script setup>
import ResumeField from "../../../components/resumeField/index.vue";

// 联系方式单项：统一处理图标 / 文字标签和字段值展示
defineProps({
  icon: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  modelValue: {
    type: Object,
    default: null,
  },
  text: {
    type: String,
    default: "",
  },
  iconMode: {
    type: Boolean,
    default: false,
  },
  hideLabel: {
    type: Boolean,
    default: false,
  },
  flowMode: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <span
    :class="
      flowMode
        ? 'mr-3 inline-flex min-w-0 items-center gap-1'
        : 'grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-1'
    "
  >
    <SfIcon v-if="iconMode" :icon="icon" size="4.5" class="shrink-0" />
    <span v-else-if="!hideLabel" class="shrink-0">{{ label }}</span>
    <span v-if="modelValue" class="min-w-0 font-medium">
      <ResumeField :model-value="modelValue" class="max-w-full min-w-0 break-words" />
    </span>
    <span v-else class="break-words">{{ text }}</span>
  </span>
</template>

<style lang="scss" scoped></style>
