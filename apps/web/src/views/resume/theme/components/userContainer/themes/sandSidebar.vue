<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  themeId: { type: String, default: "sandSidebar" }, // 当前主题编号
  moduleKey: { type: String, default: "user" }, // 个人信息模块编号
  moduleClass: { type: String, default: "" }, // 编辑器附加的模块状态类名
});
const { theme: { themeColor, fontValue, lineHeightValue } } = useResumePreviewContext();
</script>

<template>
  <!-- 复用双栏个人信息排布，仅定制头像、姓名和联系方式的外观。 -->
  <div
    class="sand-user resume-module-wrapper resume-user group group/module relative box-border w-full min-w-0"
    :class="moduleClass"
    :data-module="moduleKey"
    :data-theme="themeId"
    :style="[fontValue(), lineHeightValue(), { '--sand-user-accent': themeColor }]"
  >
    <slot name="actions" />
    <slot />
  </div>
</template>

<style scoped>
.sand-user :deep(img) {
  width: 84px;
  height: 84px;
  border: 1px solid color-mix(in srgb, var(--sand-user-accent) 36%, transparent);
  border-radius: 6px;
  box-shadow: 0 3px 9px color-mix(in srgb, var(--sand-user-accent) 16%, transparent);
}

.sand-user :deep(.tracking-wide) {
  color: var(--sand-user-accent);
  font-weight: 500;
  letter-spacing: 0.12em;
}

.sand-user :deep(svg) {
  color: var(--sand-user-accent);
}
</style>
