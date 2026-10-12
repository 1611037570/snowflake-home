<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColorLine },
} = useResumePreviewContext();
// 索引区只保留正文左侧的引导线，不再铺满灰色底板。
const gutterStyle = computed(() => ({
  "--file-index-rule": themeColorLine.value, // 序号与正文之间的细引导线
}));
</script>

<template>
  <!-- 引导线位于正文左侧的主题装饰空间，不改变正文排版宽度。 -->
  <div class="file-index-region" :style="gutterStyle">
    <span aria-hidden="true" class="file-index-region__gutter" />
    <slot />
  </div>
</template>

<style scoped>
.file-index-region__gutter {
  position: absolute;
  /* 引导线只覆盖正文区域，页眉继续保持完整留白。 */
  top: 0;
  bottom: 0;
  left: 0;
  width: calc(var(--resume-region-inset-left, 0px) - 9px);
  border-right: 1px solid var(--file-index-rule);
  pointer-events: none;
}
</style>
