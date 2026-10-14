<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 引导线绘制在正文区域左侧的装饰空间内，不改变正文排版宽度。 -->
  <div class="blue-gold-region" :style="{ '--blue-gold-rule': themeColor }">
    <span aria-hidden="true" class="blue-gold-region__rule" />
    <slot />
  </div>
</template>

<style scoped>
/* 竖线跟随正文区域高度，位置由区域左侧装饰内边距推导。 */
.blue-gold-region__rule {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--resume-region-inset-left, 0px) - 9px);
  width: 2px;
  background-color: var(--blue-gold-rule);
  pointer-events: none;
}
</style>
