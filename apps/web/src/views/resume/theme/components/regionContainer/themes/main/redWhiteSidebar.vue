<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor, themeColorContrast } } = useResumePreviewContext();
// 底色延伸到纸张边缘，左右栏内容继续使用现有页面留白。
const sidebarStyle = computed(() => ({
  "--red-sidebar-accent": themeColor.value, // 左栏背景及标题的主题色
  "--red-sidebar-contrast": themeColorContrast.value, // 左栏文字按背景亮度自动反白或转深色
  "--resume-user-avatar-max-width": "100%", // 头像不超过左栏宽度
  "--resume-user-avatar-radius": "0", // 头像直角，贴合左栏色块
  "--resume-user-name-weight": "500", // 左栏姓名字重减轻，避免深色底上过重
}));
</script>

<template>
  <div class="red-white-sidebar isolate" :style="sidebarStyle">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@use "../../columnBleed" as *;

/* 每栏独立承载背景与文字配色，不改变栏内可用尺寸。 */
.red-white-sidebar :deep(> [data-resume-column]) {
  isolation: isolate;
}

.red-white-sidebar :deep(> [data-resume-column="left"]) {
  --resume-title-border-width: 0px; /* 标题组件消费栏描边宽度。 */
  color: var(--red-sidebar-contrast);
  --red-sidebar-title: var(--red-sidebar-contrast);
}

.red-white-sidebar :deep(> [data-resume-column="left"])::before {
  @include column-bleed(left);
  background: var(--red-sidebar-accent);
}
</style>
