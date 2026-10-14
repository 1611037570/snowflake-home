<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();

// 日期栏宽、轴线与节点色统一由区域下发，标题与条目沿用同一套变量。
const timelineStyle = computed(() => ({
  "--timeline-rail-width": "96px", // 左侧日期栏连同正文间距的宽度
  "--dot-ink-line": themeColorLine.value, // 轴线起始颜色
  "--dot-ink-node": themeColor.value, // 实心圆节点与日期颜色
  "--dot-ink-paper": ui.value?.page?.background || "#ffffff", // 节点光晕取纸张底色
  "--ring-node": themeColor.value, // 公共缩进标题的节点颜色
}));
</script>

<template>
  <!-- 轴线自上而下渐淡，其余排版交给公共区域容器。 -->
  <div class="dot-ink-main" :style="timelineStyle">
    <slot />
  </div>
</template>

<style scoped>
/* 轴线贯穿栏内实际内容高度，随高度渐淡收束。 */
.dot-ink-main :deep([data-resume-column-content]) {
  position: relative;
}

.dot-ink-main :deep([data-resume-column-content])::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--timeline-rail-width) - 18px);
  width: 1px;
  background-image: linear-gradient(180deg, var(--dot-ink-line), transparent);
  pointer-events: none;
}
</style>
