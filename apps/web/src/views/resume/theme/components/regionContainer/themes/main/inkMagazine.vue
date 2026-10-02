<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 左栏以浅灰底区分辅助信息，背景不改变内容宽度与分页尺寸。 -->
  <div class="ink-magazine-main" :style="{ '--ink-magazine-accent': themeColor }">
    <slot />
  </div>
</template>

<style scoped>
.ink-magazine-main :deep(> :first-child) {
  isolation: isolate;
}

.ink-magazine-main :deep(> :first-child)::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: -12px;
  right: -12px;
  bottom: 0;
  left: -12px;
  background: color-mix(in srgb, var(--ink-magazine-accent) 5%, white);
  pointer-events: none;
}
</style>
