<script setup>
import { layoutStretchesColumns } from "@/domain/resume/theme/layouts";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  themeDecisions,
  theme: { themeColorLine },
} = useResumePreviewContext();
// 栏间细线用主题色的透明派生色，不引入任何色块与底色
const mainStyle = {
  "--minimal-divider": themeColorLine.value, // 栏间 1px 细线的颜色
};
// 单栏下不绘制栏间线，避免装饰落到错误位置
const isTwoColumn = () => layoutStretchesColumns(themeDecisions.value.layoutType);
</script>

<template>
  <!-- 正文区域只提供极细的栏间线，内容留白由 regionPadding 统一表达 -->
  <div
    class="minimal-main resume-view-container relative box-border flex w-full min-w-0"
    :class="{ 'minimal-main--two-column': isTwoColumn() }"
    :style="mainStyle"
  >
    <slot />
  </div>
</template>

<style scoped>
/* 两栏各自作为定位基准，栏间线随栏宽与栏高自动伸缩 */
.minimal-main--two-column :deep(> [data-resume-column]) {
  position: relative;
  box-sizing: border-box;
  align-self: stretch;
}

/* 栏间 1px 细线落在两栏交界的中缝，绝对定位使其不占用任何排版空间 */
.minimal-main--two-column :deep(> [data-resume-column="left"])::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0; /* 细线贴着左栏右缘，即中缝正中 */
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  width: 1px;
  background-color: color-mix(in srgb, var(--minimal-divider) 50%, transparent);
  pointer-events: none;
}
</style>
