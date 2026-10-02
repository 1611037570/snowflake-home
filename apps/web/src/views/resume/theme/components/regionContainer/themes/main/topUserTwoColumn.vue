<script>
// 正文留白只在这里声明：区域容器会按 regionPadding 自动加内边距，模板不得再写留白类。
const regionPadding = {
  top: 12, // 页眉细分隔线与首个模块标题之间的留白
  right: 0, // 水平留白沿用页面设置
  bottom: 12, // 正文与页尾预留空间之间的留白
  left: 0, // 水平留白沿用页面设置
};
export default { regionPadding };
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { themeColorLine },
} = useResumePreviewContext();
// 栏间线只服务个人信息顶部通栏的双栏版式，单栏布局下没有第二栏，装饰一并关闭。
const isTopUserTwoColumn = computed(() => ui.value?.layout?.type === "topUserTwoColumn");
// 栏间线颜色与偏移由变量下发，偏移取栏间距 24px 的一半，让线条落在栏间中线。
const mainStyle = computed(() => ({
  "--top-user-divider": themeColorLine.value, // 双栏栏间线颜色
  "--top-user-column-gap": "24px", // 引擎下发的栏间距，栏间线取其中线
  "--top-user-divider-top": `${regionPadding.top}px`, // 栏间线对齐栏内内容的起始位置
}));
</script>

<template>
  <!-- 正文外观只画装饰：留白由 regionPadding 交给容器施加，装饰用绝对定位，不占栏宽也不参与分页。 -->
  <div
    class="top-user-main relative w-full min-w-0"
    :class="{ 'top-user-main--two-column': isTopUserTwoColumn }"
    :style="mainStyle"
  >
    <slot />
  </div>
</template>

<style scoped>
/* 两栏各自作为定位基准，栏间线因此随栏宽与栏高伸缩；底边延伸到页尾预留空间之外。 */
.top-user-main--two-column :deep(> *) {
  position: relative;
  box-sizing: border-box;
  align-self: stretch;
}

/* 栏间 1px 细线锚定右栏左边缘并回退半个栏间距，与标题细分隔线共用同一套线语言。 */
.top-user-main--two-column :deep(> :nth-child(2))::before {
  content: "";
  position: absolute;
  top: calc(-1 * var(--top-user-divider-top, 12px));
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  left: calc(-0.5 * var(--top-user-column-gap, 24px));
  width: 1px;
  background-color: var(--top-user-divider);
  pointer-events: none;
}
</style>
