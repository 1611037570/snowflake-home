<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();

// 时间轴公共变量：标题节点与条目圆环共用同一份栏宽、间距与配色，避免两处数值漂移
const timelineStyle = computed(() => {
  const moduleGap = Number(ui.value?.page?.spacing?.module) || 0; // 模块之间的间距
  const paragraphGap = Number(ui.value?.page?.spacing?.paragraph) || 0; // 条目前的段间距节点高度
  return {
    "--timeline-rail-width": "96px", // 左侧时间轴栏宽：日期、节点与轴线都排在这一栏内
    // 轴线补齐量取两者较大值：条目与标题上方的留白都能被上方的线段覆盖
    "--ring-bridge": `${Math.max(moduleGap, paragraphGap)}px`,
    "--ring-line": themeColorLine.value, // 贯穿轴线颜色
    "--ring-node": themeColor.value, // 空心圆环与标题节点的颜色
    "--ring-paper": ui.value?.page?.background || "#ffffff", // 圆环内圈取纸张底色，用来遮住穿过的轴线
  };
});
</script>

<template>
  <!-- 只提供时间轴变量与轴线收口，区域留白仍由区域容器统一管理 -->
  <div class="ring-timeline-main" :style="timelineStyle">
    <slot />
  </div>
</template>

<style scoped>
/* 页面第一个模块的标题从自身节点位置起画轴线，避免轴线上方多出一截线头 */
.ring-timeline-main
  :deep(.resume-column > .resume-module-wrapper:first-of-type .ring-timeline-title::before) {
  top: 50%;
}

/* 页面第一个模块的首段同样从内容顶部起画轴线，模块间距的补齐不越过栏顶 */
.ring-timeline-main
  :deep(.resume-column > .resume-module-wrapper:first-of-type .ring-timeline-item--start::before) {
  top: 0;
}
</style>
