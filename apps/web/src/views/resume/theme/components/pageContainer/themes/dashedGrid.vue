<script setup>
import { computed } from "vue";
import { RESUME_WIDTH } from "@/views/resume/editor/preview/shared/constants";

// 固定页宽均分八列，横向与纵向使用同一边长，页面左右边缘不绘制竖线。
const gridCellSize = RESUME_WIDTH / 8;
// 每个方格保持完整的虚线周期，长短划线在交叉处居中衔接。
const gridDashLength = gridCellSize * 0.055;
const gridGapLength = gridCellSize * 0.045;
const gridLines = Array.from(
  { length: 7 /* 页面内部竖线数量 */ },
  (_, index) => `M${(index + 1) * gridCellSize} 0V${gridCellSize}`,
).join("");

// 虚线网格作为平铺背景绘制，不占用正文空间，也不参与分页测量。
const dashedGridImage = computed(
  () =>
    `url("data:image/svg+xml,${encodeURIComponent(
      // 横线放在每行底部且向内收半个线宽，避免被裁掉，也不在页面顶部生成起始线。
      `<svg xmlns="http://www.w3.org/2000/svg" width="${RESUME_WIDTH}" height="${gridCellSize}" viewBox="0 0 ${RESUME_WIDTH} ${gridCellSize}"><path d="${gridLines}M0 ${gridCellSize - 0.75}H${RESUME_WIDTH}" fill="none" stroke="#e9edf0" stroke-width="1.5" stroke-dasharray="${gridDashLength} ${gridGapLength}" stroke-dashoffset="${gridDashLength / 2}"/></svg>`,
    )}")`,
);
</script>

<template>
  <!-- 负层级让纹理压在页面底色之上、正文之下，绝对定位不参与布局 -->
  <div
    aria-hidden="true"
    class="resume-page-pattern pointer-events-none absolute inset-0 -z-10"
    :style="{ backgroundImage: dashedGridImage }"
  />
</template>

<style lang="scss" scoped></style>
