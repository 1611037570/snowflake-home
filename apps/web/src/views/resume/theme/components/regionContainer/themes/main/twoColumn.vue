<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  themeDecisions,
  theme: { themeColorSoft, themeColorLine },
} = useResumePreviewContext();
// 左栏浅底与栏间细线只服务左右双栏布局，单栏布局下没有任何装饰需要绘制。
const isTwoColumn = computed(() => themeDecisions.value.layoutType === "twoColumn");
// 装饰的尺寸与颜色统一由变量下发，样式里不写死色值与像素。
const twoColumnStyle = computed(() => ({
  "--two-column-surface": themeColorSoft.value, // 左栏浅底
  "--two-column-divider": themeColorLine.value, // 栏间 1px 细线
  "--two-column-top": "var(--resume-region-inset-top)", // 装饰向上覆盖正文顶部留白
  "--two-column-side": "var(--resume-page-inset-horizontal)", // 左栏底色铺到纸张左边缘
  "--two-column-half-gap": "var(--resume-column-gap-half)", // 装饰沿公共栏间距的中线绘制
}));
</script>

<template>
  <!-- 根元素不写任何留白类：内边距由引擎按 regionPadding 下发，装饰只走绝对定位。 -->
  <div
    class="two-column-main relative box-border flex w-full min-w-0"
    :class="{ 'two-column-main--enabled': isTwoColumn }"
    :style="twoColumnStyle"
  >
    <slot />
  </div>
</template>

<style scoped>
/* 两栏都以自身为定位基准，左栏底色与栏间线随栏宽和栏高自动变化。 */
.two-column-main :deep(> *) {
  position: relative;
  box-sizing: border-box;
  align-self: stretch;
}

.two-column-main--enabled :deep(> :first-child) {
  isolation: isolate;
}

/* 左栏浅底：向上覆盖正文留白与纸张上边距，向左铺到纸张边缘，向下延伸到页脚预留空间。 */
.two-column-main--enabled :deep(> :first-child)::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: calc(-1 * (var(--two-column-top, 0px) + var(--resume-page-top-space, 0px)));
  right: calc(-1 * var(--two-column-half-gap, 12px));
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  left: calc(-1 * var(--two-column-side, 0px));
  background-color: var(--two-column-surface);
  pointer-events: none;
}

/* 栏间 1px 细线落在栏间距正中，与左栏浅底同高，本身不占用任何排版空间。 */
.two-column-main--enabled > :deep(:first-child:not(:last-child))::after {
  content: "";
  position: absolute;
  top: calc(-1 * (var(--two-column-top, 0px) + var(--resume-page-top-space, 0px)));
  right: calc(-1 * var(--two-column-half-gap, 12px));
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  width: 1px;
  background-color: var(--two-column-divider);
  pointer-events: none;
}
</style>
