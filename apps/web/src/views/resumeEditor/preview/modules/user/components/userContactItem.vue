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
});
</script>

<template>
  <div class="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-1">
    <SfIcon v-if="iconMode" :icon="icon" size="4.5" class="mr-1 shrink-0" />
    <div v-else class="pr-1">{{ label }}</div>
    <div v-if="modelValue" class="max-w-full min-w-0 font-medium">
      <ResumeField :model-value="modelValue" />
    </div>
    <span v-else>{{ text }}</span>
  </div>
</template>

<style lang="scss" scoped></style>
