<script>
// 正文留白只在这里声明：引擎按同一份数值加内边距，分页测量与真实渲染共用一个口径。
const regionPadding = {
  top: 36, // 双栏内容距正文区顶部的留白
  right: 0, // 水平留白沿用页面设置
  bottom: 0, // 页尾留白由栏内页脚预留空间单独承担
  left: 0, // 水平留白沿用页面设置
};
export default { regionPadding };
</script>

<script setup>
import { computed } from "vue";
import { defaultPaddingHorizontal } from "@/stores/modules/resume/config/uiConfig";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { themeColorSoft, themeColorLine },
} = useResumePreviewContext();
// 左栏浅底与栏间细线只服务左右双栏布局，单栏布局下没有任何装饰需要绘制。
const isTwoColumn = computed(() => ui.value?.layout?.type === "twoColumn");
// 装饰的尺寸与颜色统一由变量下发，样式里不写死色值与像素。
const twoColumnStyle = computed(() => ({
  "--two-column-surface": themeColorSoft.value, // 左栏浅底
  "--two-column-divider": themeColorLine.value, // 栏间 1px 细线
  "--two-column-top": `${regionPadding.top}px`, // 装饰向上覆盖正文顶部留白
  "--two-column-side": `${Math.max(0, Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal) || 0)}px`, // 左栏底色铺到纸张左边缘
  "--two-column-half-gap": "12px", // 栏间距 24px 的一半，装饰落在栏间正中
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

/* 左栏浅底：向上覆盖正文顶部留白，向左铺到纸张边缘，向下延伸到页脚预留空间。 */
.two-column-main--enabled :deep(> :first-child)::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: calc(-1 * var(--two-column-top, 36px));
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
  top: calc(-1 * var(--two-column-top, 36px));
  right: calc(-1 * var(--two-column-half-gap, 12px));
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  width: 1px;
  background-color: var(--two-column-divider);
  pointer-events: none;
}
</style>
