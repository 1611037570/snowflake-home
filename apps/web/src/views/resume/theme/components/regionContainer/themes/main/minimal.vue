<script>
// 正文留白由组件声明，分页与真实预览读取同一份尺寸。
const regionPadding = {
  top: 24, // 正文首行与区域顶部之间的留白
  right: 0, // 水平留白沿用页面配置
  bottom: 12, // 正文与页尾预留空间之间的留白
  left: 0, // 水平留白沿用页面配置
};
export default { regionPadding };
</script>

<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { themeColorLine },
} = useResumePreviewContext();
// 栏间细线用主题色的透明派生色，不引入任何色块与底色
const mainStyle = {
  "--minimal-divider": themeColorLine.value, // 栏间 1px 细线的颜色
};
// 单栏下不绘制栏间线，避免装饰落到错误位置
const isTwoColumn = () =>
  ui.value?.layout?.type === "twoColumn" || ui.value?.layout?.type === "topUserTwoColumn";
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
.minimal-main--two-column :deep(> *) {
  position: relative;
  box-sizing: border-box;
  align-self: stretch;
}

/* 栏间 1px 细线落在栏间距正中，绝对定位使其不占用任何排版空间 */
.minimal-main--two-column :deep(> :first-child)::after {
  content: "";
  position: absolute;
  top: 0;
  right: -12px;
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  width: 1px;
  background-color: color-mix(in srgb, var(--minimal-divider) 50%, transparent);
  pointer-events: none;
}
</style>
