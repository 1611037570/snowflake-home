<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor, themeColorContrast } } = useResumePreviewContext();
// 底色延伸到纸张边缘，左右栏内容继续使用现有页面留白。
const sidebarStyle = computed(() => ({
  "--red-sidebar-horizontal": "var(--resume-page-inset-horizontal)", // 底色向纸张左边缘延伸的距离
  "--red-sidebar-vertical": "var(--resume-page-inset-vertical)", // 底色向纸张上边缘延伸的距离
  "--red-sidebar-accent": themeColor.value, // 左栏背景及标题的主题色
  "--red-sidebar-contrast": themeColorContrast.value, // 左栏文字按背景亮度自动反白或转深色
  "--red-sidebar-diamonds": `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><path fill="${themeColor.value}" d="M120 42l24 24-24 24-24-24zM42 162l24 24-24 24-24-24z"/></svg>`)}")`, // 右栏不占排版空间的淡菱形底纹
}));
</script>

<template>
  <div class="red-white-sidebar isolate" :style="sidebarStyle">
    <slot />
  </div>
</template>

<style scoped>
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
  content: "";
  position: absolute;
  z-index: -1;
  top: calc(-1 * var(--red-sidebar-vertical));
  right: calc(-1 * var(--resume-column-gap-half));
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  left: calc(-1 * var(--red-sidebar-horizontal));
  background: var(--red-sidebar-accent);
  pointer-events: none;
}

.red-white-sidebar :deep(> [data-resume-column="right"])::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: 0;
  background-image: var(--red-sidebar-diamonds);
  opacity: 0.025;
  pointer-events: none;
}
</style>
