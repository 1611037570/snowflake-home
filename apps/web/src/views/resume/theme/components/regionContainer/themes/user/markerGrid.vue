<script>
// 页眉留白只在组件里声明一次，分页与区域容器共用该数值。
const regionPadding = {
  top: 0, // 顶部距离统一使用用户页面上边距
  right: 0, // 水平留白沿用页面设置
  bottom: 0, // 与正文之间的距离仅由模块间距控制
  left: 0, // 水平留白沿用页面设置
};
export default {
  regionPadding, // 分页与组件共用的页眉留白
};
</script>

<script setup>
import { computed } from "vue";
import { RESUME_WIDTH } from "@/views/resume/editor/preview/shared/constants";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 基线刻度按页面八等分单元分布，与页面竖网和正文点阵同源。
const GRID_UNIT = RESUME_WIDTH / 8;

const {
  theme: { themeColor },
} = useResumePreviewContext();

// 基线只画在两处：一条整宽细线做量尺，刻度短线与网格单元同距。
const headerStyle = computed(() => ({
  "--marker-user-line": `color-mix(in srgb, ${themeColor.value} 34%, transparent)`, // 基线细线颜色
  "--marker-user-tick": `color-mix(in srgb, ${themeColor.value} 55%, transparent)`, // 刻度短线颜色
  "--marker-user-unit": `${GRID_UNIT}px`, // 刻度间距，与页面网格单元等宽
}));
</script>

<template>
  <!-- 个人信息底部以量尺基线与刻度收尾，装饰为绝对定位不占布局。 -->
  <div class="marker-grid-user relative box-border" :style="headerStyle">
    <slot />
  </div>
</template>

<style scoped>
/* 整宽基线：贴在页眉底沿，作为个人信息与正文之间的分界。 */
.marker-grid-user::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1px;
  background-color: var(--marker-user-line);
  pointer-events: none;
}

/* 基线刻度：按网格单元重复的短线，呼应标题笔刷与点阵网格。 */
.marker-grid-user::before {
  content: "";
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 6px;
  background-image: repeating-linear-gradient(
    to right,
    var(--marker-user-tick) 0 1px,
    transparent 1px var(--marker-user-unit)
  );
  pointer-events: none;
}
</style>
