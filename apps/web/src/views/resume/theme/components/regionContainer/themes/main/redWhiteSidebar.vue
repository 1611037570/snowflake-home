<script setup>
import { computed } from "vue";
import { defaultPaddingHorizontal, defaultPaddingVertical, defaultPageRadius } from "@/stores/modules/resume/config/uiConfig";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { ui, theme: { themeColor } } = useResumePreviewContext();
// 底色延伸到纸张边缘，左右栏内容继续使用现有页面留白。
const sidebarStyle = computed(() => ({
  "--red-sidebar-horizontal": `${Math.max(0, Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal) || 0)}px`, // 底色向纸张左边缘延伸的距离
  "--red-sidebar-vertical": `${Math.max(0, Number(ui.value?.page?.padding?.vertical ?? defaultPaddingVertical) || 0)}px`, // 底色向纸张上边缘延伸的距离
  "--red-sidebar-radius": `${Math.max(0, Number(ui.value?.page?.radius ?? defaultPageRadius) || 0)}px`, // 侧栏沿用纸张圆角
  "--red-sidebar-accent": themeColor.value, // 左栏背景及标题的主题色
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
.red-white-sidebar :deep(> *) {
  isolation: isolate;
}

.red-white-sidebar :deep(> :first-child) {
  color: white;
  --red-sidebar-title: white;
}

.red-white-sidebar :deep(> :first-child)::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: calc(-1 * var(--red-sidebar-vertical));
  right: -12px;
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  left: calc(-1 * var(--red-sidebar-horizontal));
  border-top-left-radius: var(--red-sidebar-radius);
  border-bottom-left-radius: var(--red-sidebar-radius);
  background: var(--red-sidebar-accent);
  pointer-events: none;
}

/* 左栏标题保持纯文字，右栏保留通栏红色细线。 */
.red-white-sidebar :deep(> :first-child .red-white-title) {
  border-bottom: none;
}

.red-white-sidebar :deep(> :last-child)::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: 0;
  background-image: var(--red-sidebar-diamonds);
  opacity: 0.025;
  pointer-events: none;
}
</style>
