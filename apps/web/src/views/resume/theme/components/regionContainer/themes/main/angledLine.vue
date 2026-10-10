<script>
// 正文留白由组件声明，分页和真实预览读取相同尺寸：左留白让出贯穿竖线所在列。
const regionPadding = {
  top: 0, // 正文顶部留白沿用页面设置
  right: 0, // 正文右侧留白沿用页面设置
  bottom: 0, // 正文底部留白沿用页面设置
  left: 24, // 左侧让出贯穿竖线的定位列
};
export default { regionPadding };
</script>

<script setup>
import { computed } from "vue";
import { layoutStretchesColumns } from "@/views/resume/theme/layouts";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  themeDecisions,
  theme: { themeColorLine },
} = useResumePreviewContext();
// 双栏布局下栏位铺满纸张高度，竖线需要为页脚预留空间才能贯穿到底。
const stretchColumns = computed(() => layoutStretchesColumns(themeDecisions.value.layoutType));
// 竖线色随主题色推导，条目左留白与区域左留白取同一个值即可保持对齐。
const railStyle = computed(() => ({
  "--angled-rail-color": themeColorLine.value, // 竖线使用的主题线条色
}));
</script>

<template>
  <!-- 竖线锚定正文栏，贯穿标题、条目与模块间距，移除顶端三角装饰。 -->
  <div
    class="angled-line-region relative"
    :class="{ 'angled-line-region--stretch': stretchColumns }"
    :style="railStyle"
  >
    <slot />
  </div>
</template>

<style scoped>
/* 竖线按正文栏实际高度绘制：不留 bottom 空白，页脚区域不被覆盖。 */
.angled-line-region :deep(.resume-column) {
  position: relative;
}

.angled-line-region :deep(.resume-column)::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 1px;
  background-color: var(--angled-rail-color);
  opacity: 0.6;
  pointer-events: none;
}

/* 双栏栏位铺满纸张时竖线随之下探，底部避开页脚预留空间。 */
.angled-line-region--stretch :deep(.resume-column)::before {
  bottom: var(--resume-bottom-space, 0px);
}
</style>
