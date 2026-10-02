<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  themeId: { type: String, default: "inkMagazine" }, // 当前主题编号
  moduleKey: { type: String, default: "user" }, // 个人信息模块编号
  moduleClass: { type: String, default: "" }, // 编辑器附加的模块状态类名
});
const { theme: { fontValue, lineHeightValue, themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 页眉留白及边线由组件自身占位，测量与实际渲染使用同一外观。 -->
  <div
    class="ink-magazine-user resume-module-wrapper resume-user group group/module relative box-border w-full min-w-0 border-t-[3px] pt-6 pb-6"
    :class="moduleClass"
    :data-module="moduleKey"
    :data-theme="themeId"
    :style="[fontValue(), lineHeightValue(), { borderColor: themeColor, '--ink-name-size': fontValue(22).fontSize }]"
  >
    <slot name="actions" />
    <slot />
  </div>
</template>

<style scoped>
/* 姓名放大为杂志页眉，保留共用姓名组件的字段显示与副标题能力。 */
.ink-magazine-user :deep(.tracking-wide > :first-child) {
  font-size: var(--ink-name-size) !important;
  line-height: 1.2;
  letter-spacing: 0.04em;
}

.ink-magazine-user :deep(img) {
  border-radius: 0;
}
</style>
