<script>
// 正文留白由组件声明，分页与预览读取同一份尺寸；引擎容器已按 regionPadding 加内边距，组件不再写留白类。
const regionPadding = {
  top: 12, // 正文与页眉区域之间的呼吸留白
  right: 0, // 水平留白沿用页面设置，保证点阵与页面网格对齐
  bottom: 0, // 底部留白沿用页面设置
  left: 0, // 水平留白沿用页面设置，保证点阵与页面网格对齐
};
export default {
  regionPadding, // 分页与组件共用的正文留白
};
</script>

<script setup>
import { computed } from "vue";
import { RESUME_WIDTH } from "@/views/resume/editor/preview/shared/constants";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 点阵格距取页面八等分单元的三分之一，与页面虚线网格保持整数倍呼应。
const GRID_UNIT = RESUME_WIDTH / 8;
// 点阵单元格边长：细密但不压正文
const GRID_CELL = GRID_UNIT / 3;
// 点阵圆点直径：隐约的交叉点提示
const GRID_DOT = 1;

const {
  theme: { themeColor },
} = useResumePreviewContext();

// 纹理画在正文自身的内容盒上，装饰只用绝对定位，不改变分页尺寸。
const regionStyle = computed(() => ({
  "--marker-region-dot": `color-mix(in srgb, ${themeColor.value} 26%, transparent)`, // 点阵圆点颜色
  "--marker-region-cell": `${GRID_CELL}px`, // 点阵单元格边长
  "--marker-region-offset": `${GRID_CELL / 2}px`, // 圆点在单元格内的居中偏移
  "--marker-region-dot-size": `${GRID_DOT}px`, // 单个圆点的直径
}));
</script>

<template>
  <!-- 正文点阵底纹沉在内容之下：模板根元素不出现任何留白类。 -->
  <div class="marker-grid-region" :style="regionStyle">
    <slot />
  </div>
</template>

<style scoped>
.marker-grid-region {
  position: relative;
  isolation: isolate;
}

/* 点阵底纹铺满正文内容盒，负层级压在文字之下、纸张背景之上。 */
.marker-grid-region::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: 0;
  background-image: radial-gradient(
    circle at var(--marker-region-offset) var(--marker-region-offset),
    var(--marker-region-dot) 0 var(--marker-region-dot-size),
    transparent var(--marker-region-dot-size)
  );
  background-position: 0 0;
  background-size: var(--marker-region-cell) var(--marker-region-cell);
  pointer-events: none;
}
</style>
