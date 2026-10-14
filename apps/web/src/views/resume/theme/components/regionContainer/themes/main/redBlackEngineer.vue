<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 侧栏底板与中轴不占正文尺寸，测量及预览沿用公共栏盒子。 -->
  <div
    class="red-black-main relative isolate flex w-full min-w-0"
    :style="{ '--red-black-accent': themeColor }"
  >
    <slot />
  </div>
</template>

<style scoped>
.red-black-main :deep(> [data-resume-column="right"]) {
  isolation: isolate;
}
.red-black-main :deep(> [data-resume-column="right"])::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: calc(-1 * var(--resume-region-inset-top));
  left: 0; /* 右栏底板从两栏交界的中缝开始 */
  right: calc(-1 * var(--resume-page-inset-horizontal));
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  background: #fafafa;
  border-left: 2px solid #111111;
  pointer-events: none;
}
/* 经历正文使用红色短横线标记，沿用富文本原有缩进与行高。 */
.red-black-main :deep([data-layout-text-block] li) {
  position: relative;
  list-style: none;
}
.red-black-main :deep([data-layout-text-block] li)::before {
  content: "";
  position: absolute;
  left: -12px;
  top: 0.75em;
  width: 6px;
  height: 2px;
  background: var(--red-black-accent);
}
.red-black-main :deep(.resume-item .whitespace-nowrap.rounded-3xl) {
  border-radius: 0;
  background: #111111 !important;
  color: #ffffff !important;
}
</style>
