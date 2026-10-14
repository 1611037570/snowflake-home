<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
// 右栏底色覆盖纸张边缘，内容仍使用统一正文容器的留白与分页尺寸。
const sidebarStyle = computed(() => ({
  "--slate-accent": themeColor.value, // 装饰与文字使用的主题色
}));
</script>

<template>
  <div class="slate-sidebar isolate" :style="sidebarStyle">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@use "../../columnBleed" as *;

/* 底色以右栏为定位基准，停在栏间中缝并延伸到纸张四周。 */
.slate-sidebar :deep(> [data-resume-column="right"]) {
  isolation: isolate;
}

.slate-sidebar :deep(> [data-resume-column="right"])::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: calc(-1 * var(--resume-page-inset-vertical, 0px));
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  right: calc(-1 * var(--resume-page-inset-horizontal, 0px));
  left: 0;
  pointer-events: none;
  background: color-mix(in srgb, var(--slate-accent) 12%, white);
}
</style>
