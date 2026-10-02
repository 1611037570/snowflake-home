<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  themeId: { type: String, default: "redWhiteSidebar" }, // 当前主题编号
  moduleKey: { type: String, default: "user" }, // 个人信息模块编号
  moduleClass: { type: String, default: "" }, // 编辑器附加的模块状态类名
});
const { theme: { fontValue, lineHeightValue } } = useResumePreviewContext();
</script>

<template>
  <!-- 复用双栏个人信息组件，头像保持矩形，信息继承所在栏的配色。 -->
  <div
    class="red-white-user resume-module-wrapper resume-user group group/module relative box-border w-full min-w-0"
    :class="moduleClass"
    :data-module="moduleKey"
    :data-theme="themeId"
    :style="[fontValue(), lineHeightValue()]"
  >
    <slot name="actions" />
    <slot />
  </div>
</template>

<style scoped>
.red-white-user :deep(img) {
  max-width: 100%;
  border: 1px solid currentColor;
  border-radius: 0;
}

.red-white-user :deep(.tracking-wide) {
  font-weight: 500;
}
</style>
