<script>
// 正文留白只声明不落地：区域容器按这份数值加内边距，分页扣除同一份高度。
const regionPadding = {
  top: 18, // 首个模块标题与上方区域之间的留白
  right: 0, // 右侧留白沿用页面设置
  bottom: 18, // 正文末尾与页脚预留空间之间的留白
  left: 0, // 左侧留白沿用页面设置
};
export default { regionPadding };
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor, themeColorSoft, themeColorLine },
} = useResumePreviewContext();

/** 弧线画布尺寸：装饰层尺寸，不参与正文测量 */
const ARC_BOX = { width: 120, height: 84 };
/** 弧线半径：三条弧共用同一半径，保证等距错位 */
const ARC_RADIUS = 72;
/** 弧线落脚点高度：圆心与落脚的高度差，换算后弧线终点正好压在画布下沿 */
const ARC_DROP = 84;
/** 左侧缩进：弧线的最外层落脚点与纸张右边距对齐 */
const ARC_LEFT = 24;
/** 层与层之间的错位距离：与标题三层弧线的间距保持同一节奏 */
const ARC_STEP = 12;

// 三条同半径弧线沿对角线等距错位，延续标题层叠弧线的三层节奏。
const arcPaths = computed(() => {
  const first = ARC_LEFT + ARC_RADIUS * 2;
  return [0, 1, 2].map((layer) => {
    const start = first - layer * ARC_STEP;
    const end = start + ARC_RADIUS;
    return [
      `M${ARC_LEFT} ${ARC_DROP}`,
      `A${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${start} 0`,
      `H${end}`,
      `V${ARC_DROP}`,
      `H${ARC_LEFT}`,
      "Z",
    ].join(" ");
  });
});
</script>

<template>
  <!-- 正文外观只绘制装饰：留白由区域容器按 regionPadding 施加，弧线全部绝对定位。 -->
  <div class="layered-region-main relative box-border w-full min-w-0">
    <!-- 区域右上弧线：三层弧线由内向外依次变浅，弧尾在画布底部渐隐，不遮挡正文。 -->
    <svg
      aria-hidden="true"
      class="layered-region-main__arc pointer-events-none absolute top-6 right-0"
      :width="ARC_BOX.width"
      :height="ARC_BOX.height"
      :viewBox="`0 0 ${ARC_BOX.width} ${ARC_BOX.height}`"
      preserveAspectRatio="none"
    >
      <path :d="arcPaths[0]" :fill="themeColor" opacity="0.16" />
      <path :d="arcPaths[1]" :fill="themeColorSoft" />
      <path :d="arcPaths[2]" :fill="themeColorLine" opacity="0.4" />
    </svg>
    <slot />
  </div>
</template>

<style scoped>
/* 弧线画布底边渐隐：弧尾自然淡出，不留下生硬的横向截断。 */
.layered-region-main__arc {
  mask-image: linear-gradient(to bottom, #000 55%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, #000 55%, transparent 100%);
}
</style>
