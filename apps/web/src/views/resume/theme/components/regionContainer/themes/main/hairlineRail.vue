<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();

// 日期栏宽、轴线与节点色统一由区域下发，标题与条目沿用同一套变量。
const timelineStyle = computed(() => ({
  "--timeline-rail-width": "84px", // 左侧日期栏连同正文间距的宽度
  "--hairline-line": themeColorLine.value, // 贯穿轴线颜色
  "--hairline-node": themeColor.value, // 短刻度与文字颜色
  "--ring-node": themeColor.value, // 公共缩进标题的节点颜色
}));
</script>

<template>
  <!-- 只绘制贯穿轴线，栏宽与留白仍由公共区域容器管理。 -->
  <div class="hairline-rail-main" :style="timelineStyle">
    <slot />
  </div>
</template>

<style scoped>
/* 轴线随栏内实际内容高度贯穿，避免逐条绘制在段间距处断开。 */
.hairline-rail-main :deep([data-resume-column-content]) {
  position: relative;
}

.hairline-rail-main :deep([data-resume-column-content])::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--timeline-rail-width) - 18px);
  width: 1px;
  background-color: var(--hairline-line);
  pointer-events: none;
}
</style>
