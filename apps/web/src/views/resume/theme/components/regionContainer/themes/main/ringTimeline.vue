<script>
// 正文与顶部个人信息之间的距离只在正文声明一次，仅作用于首页。
export default {
  gapBefore: 24, // 个人信息与时间轴正文之间的留白
};
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();

// 时间轴公共变量：模块竖线与标题、条目节点共用栏宽和配色。
const timelineStyle = computed(() => {
  const moduleGap = Number(ui.value?.page?.spacing?.module) || 0; // 模块之间的间距
  return {
    "--timeline-rail-width": "96px", // 左侧时间轴栏宽：日期、节点与轴线都排在这一栏内
    "--ring-module-gap": `${moduleGap}px`, // 模块竖线向上连接相邻模块间距
    "--ring-line": themeColorLine.value, // 贯穿轴线颜色
    "--ring-node": themeColor.value, // 空心圆环与标题节点的颜色
    "--ring-paper": ui.value?.page?.background || "#ffffff", // 圆环内圈取纸张底色，用来遮住穿过的轴线
  };
});
</script>

<template>
  <!-- 模块统一绘制竖线，覆盖标题、条目和段间距，区域留白保持原样。 -->
  <div class="ring-timeline-main" :style="timelineStyle">
    <slot />
  </div>
</template>

<style scoped>
/* 竖线覆盖正文模块完整高度，避免逐条绘制在段间距处断开。 */
.ring-timeline-main :deep(.resume-column > .resume-module-wrapper:not([data-module="user"]))::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--timeline-rail-width) - 18px);
  width: 1px;
  background-color: var(--ring-line);
  pointer-events: none;
}

/* 后续正文模块向上补齐间距，首个模块不向个人信息区域延伸。 */
.ring-timeline-main :deep(.resume-column > .resume-module-wrapper:not([data-module="user"]) ~ .resume-module-wrapper:not([data-module="user"]))::before {
  top: calc(-1 * var(--ring-module-gap));
}
</style>
