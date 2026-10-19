<script setup>
import { computed } from "vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { safeContentUrl } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

// 联系方式单项：统一处理图标 / 文字标签和字段值展示
const props = defineProps({
  icon: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  modelValue: {
    type: [String, Number, Array, Object],
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

// 仅把安全协议的网址渲染为可点击链接，普通联系方式继续按文本展示。
const linkUrl = computed(() => safeContentUrl(props.modelValue));
</script>

<template>
  <span
    class="resume-contact-item"
    :class="
      flowMode
        ? 'inline-flex min-w-0 items-center gap-1'
        : 'grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-1'
    "
  >
    <SfIcon v-if="iconMode" :icon="icon" size="4.5" class="shrink-0" />
    <span v-else-if="!hideLabel" class="resume-contact-label shrink-0">{{ label }}</span>
    <a
      v-if="modelValue && linkUrl"
      :href="linkUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="min-w-0 font-medium hover:underline"
    >
      <ResumeField
        :tag="flowMode ? 'span' : 'div'"
        :model-value="modelValue"
        class="max-w-full min-w-0 break-words"
      />
    </a>
    <span v-else-if="modelValue" class="min-w-0 font-medium">
      <ResumeField
        :tag="flowMode ? 'span' : 'div'"
        :model-value="modelValue"
        class="max-w-full min-w-0 break-words"
      />
    </span>
    <span v-else class="break-words">{{ text }}</span>
  </span>
</template>

<style lang="scss" scoped>
/* 图标配色由主题变量决定，未声明时保持继承图标自身配色。 */
.resume-contact-item :deep(svg) {
  color: var(--resume-user-icon-color, inherit);
}

/* 单项列间距与标签配色同样由主题变量下发。 */
.resume-contact-item {
  column-gap: var(--resume-user-contact-item-column-gap, 0.25rem); // 标签与数值之间的间距
}

.resume-contact-label {
  color: var(--resume-user-contact-label-color, inherit); // 字段标签配色
}
</style>
