<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor },
} = useResumePreviewContext();

// 墨阶正文：日期栏是一根浅色刻度柱，序号与日期共用同一读数列，强调色只留给刻度与序号。
const timelineStyle = computed(() => ({
  "--timeline-rail-width": "108px", // 左侧读数列与轴线所在的宽度
  "--ink-tick": themeColor.value, // 刻度横杠、日期与序号的强调色
  "--ink-rail-tint": "#F1EDE6", // 读数列底色，比纸张深一档
  "--ink-axis": "#D6D0C6", // 读数列与正文之间的轴线
  "--ink-rule": "#E7E2D9", // 条目之间的账簿细线
  "--ink-rail-gap": "15px", // 读数右缘与轴线之间的距离
}));
</script>

<template>
  <!-- 刻度柱与轴线画在区域根上，模块标题、日期与条目沿同一条线对齐。 -->
  <div class="ink-main" :style="timelineStyle">
    <slot />
  </div>
</template>

<style scoped>
/* 区域根单独建立堆叠上下文，底色与轴线只压在正文之下。 */
.ink-main {
  isolation: isolate;
}

/* 读数列沿区域全高铺设：向上只补续页的纸张上边距，向下只补页尾预留空间，左侧直达纸张左缘。 */
.ink-main::after {
  content: "";
  position: absolute;
  z-index: -1;
  top: calc(-1 * var(--resume-page-top-space, 0px));
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  left: calc(-1 * var(--resume-page-inset-horizontal));
  width: calc(var(--timeline-rail-width) - 18px + var(--resume-page-inset-horizontal));
  background-color: var(--ink-rail-tint);
  pointer-events: none;
}

/* 轴线与底色同高贯穿整根读数列，段间距与模块间距不断线。 */
.ink-main::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: calc(-1 * var(--resume-page-top-space, 0px));
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  left: calc(var(--timeline-rail-width) - 18px);
  width: 1px;
  background-color: var(--ink-axis);
  pointer-events: none;
}
</style>
