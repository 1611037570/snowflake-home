<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  themeId: { type: String, default: "navyGuide" }, // 当前主题编号
  moduleKey: { type: String, default: "user" }, // 个人信息模块编号
  moduleClass: { type: String, default: "" }, // 编辑器附加的模块状态类名
});
const {
  theme: { fontValue, lineHeightValue, themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 头像衬边与尺寸只在本主题个人信息外观中维护。 -->
  <div
    class="resume-module-wrapper resume-user group group/module box-border w-full min-w-0"
    :class="moduleClass"
    :data-module="moduleKey"
    :data-theme="themeId"
    :style="[lineHeightValue(), fontValue(), { '--navy-guide-accent': themeColor }]"
  >
    <slot name="actions" />
    <div class="w-full min-w-0"><slot /></div>
  </div>
</template>

<style scoped>
/* 方形头像的蓝色偏移衬边不占排版尺寸。 */
.resume-user :deep(img) {
  width: 114px;
  height: 114px;
  border-radius: 0;
  margin-right: 36px;
  box-shadow: 6px 6px 0 var(--navy-guide-accent);
}
</style>
