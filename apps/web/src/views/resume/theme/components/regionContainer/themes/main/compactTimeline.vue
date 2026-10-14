<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor, themeColorLine } } = useResumePreviewContext();
// 日期、标题、条目与轴线共用足够容纳完整日期的栏宽。
const timelineStyle = computed(() => ({
  "--timeline-rail-width": "144px", // 日期栏连同正文间距的宽度
  "--ring-node": themeColor.value, // 现有时间轴标题节点颜色
  "--hairline-node": themeColor.value, // 复用条目刻度与日期文字颜色
  "--compact-timeline-line": themeColorLine.value, // 日期带右缘的轴线颜色
}));
</script>

<template>
  <!-- 仅绘制贯穿轴线，日期与分页继续交给公共组件。 -->
  <div class="compact-timeline-main" :style="timelineStyle">
    <slot />
  </div>
</template>

<style scoped>
.compact-timeline-main :deep([data-resume-column-content]) {
  position: relative;
}

/* 日期栏与正文之间保留稳定的分界线。 */
.compact-timeline-main :deep([data-resume-column-content])::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--timeline-rail-width) - 18px);
  width: 1px;
  background: var(--compact-timeline-line);
  pointer-events: none;
}
</style>
