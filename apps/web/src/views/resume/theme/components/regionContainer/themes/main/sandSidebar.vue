<script setup>
import { computed } from "vue";
import { defaultPaddingHorizontal, defaultPaddingVertical, defaultPageRadius } from "@/stores/modules/resume/config/uiConfig";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { ui, theme: { themeColor } } = useResumePreviewContext();
// 侧栏底色覆盖纸张边缘，内容仍使用统一正文容器的留白与分页尺寸。
const sidebarStyle = computed(() => ({
  "--sand-side-bleed": `${Math.max(0, Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal) || 0)}px`, // 左侧底色延伸至纸张边缘的距离
  "--sand-top-bleed": `${Math.max(0, Number(ui.value?.page?.padding?.vertical ?? defaultPaddingVertical) || 0)}px`, // 顶部底色延伸至纸张边缘的距离
  "--sand-page-radius": `${Math.max(0, Number(ui.value?.page?.radius ?? defaultPageRadius) || 0)}px`, // 左侧底色沿用纸张圆角
  "--sand-accent": themeColor.value, // 装饰与文字使用的主题色
}));
</script>

<template>
  <div class="sand-sidebar isolate" :style="sidebarStyle">
    <slot />
  </div>
</template>

<style scoped>
/* 底色以左栏为定位基准，覆盖半个栏间距并延伸到纸张四周。 */
.sand-sidebar :deep(> :first-child) {
  isolation: isolate;
}

.sand-sidebar :deep(> :first-child)::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: calc(-1 * var(--sand-top-bleed));
  right: -12px;
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  left: calc(-1 * var(--sand-side-bleed));
  border-top-left-radius: var(--sand-page-radius);
  border-bottom-left-radius: var(--sand-page-radius);
  background: color-mix(in srgb, var(--sand-accent) 13%, white);
  pointer-events: none;
}

/* 教育分隔线只绘制在完成的条目末尾，不改变条目测量高度。 */
.sand-sidebar :deep([data-module="education"] .sand-item[data-item-complete="true"])::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1px;
  background: color-mix(in srgb, var(--sand-accent) 16%, white);
  pointer-events: none;
}
</style>
