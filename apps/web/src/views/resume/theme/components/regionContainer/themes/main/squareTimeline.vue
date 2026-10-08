<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor },
} = useResumePreviewContext();
// 同一份侧栏宽度控制标题、日期、正文和竖线的对齐。
const timelineStyle = computed(() => ({
  "--square-timeline-color": themeColor.value, // 节点与线条的主题色
  "--square-timeline-rail-width": "108px", // 左侧日期区域连同正文间距的宽度
}));
</script>

<template>
  <!-- 仅绘制主题外观，剩余高度与容器留白仍由区域入口统一管理。 -->
  <div
    class="square-timeline"
    :style="timelineStyle"
  >
    <slot />
  </div>
</template>

<style scoped>
/* 竖线跟随栏内实际内容高度，连接标题和模块间距，不延伸到页尾空白。 */
.square-timeline :deep(.resume-column) {
  position: relative;
}

.square-timeline :deep(.resume-column)::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--square-timeline-rail-width) - 18px);
  width: 1px;
  background-color: var(--square-timeline-color);
  pointer-events: none;
}

/* 首段从标题节点开始画线，跨页续段从正文顶部继续画线。 */
.square-timeline :deep(.resume-column:has(> .resume-module-wrapper:first-of-type .square-timeline-title))::before {
  top: 12px;
}

/* 复用现有日期侧栏，具体宽度与标题节点共用同一份值。 */
.square-timeline :deep(.resume-item--timeline) {
  --timeline-rail-width: var(--square-timeline-rail-width);
}

/* 仅有日期头部的首段保留三行日期高度，跨页续段按正文自身高度排版。 */
.square-timeline :deep(.resume-item--timeline:has(.resume-timeline-date)) {
  min-height: 3lh;
}

.square-timeline :deep(.resume-item--timeline)::before {
  display: none;
}

/* 覆盖默认条目的零留白，没有日期的内容也对齐右侧正文。 */
.square-timeline :deep(.resume-item:not(.resume-item--timeline)) {
  padding-left: var(--square-timeline-rail-width) !important;
}

.square-timeline :deep(.resume-timeline-date) {
  justify-content: center;
  opacity: 1;
}

.square-timeline :deep(.resume-timeline-date > span) {
  width: min-content;
  text-align: center;
}
</style>
