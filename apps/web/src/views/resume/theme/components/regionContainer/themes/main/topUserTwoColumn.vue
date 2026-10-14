<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  themeDecisions,
  theme: { themeColorLine },
} = useResumePreviewContext();
// 栏间线只服务个人信息顶部通栏的双栏版式，单栏布局下没有第二栏，装饰一并关闭。
const isTopUserTwoColumn = computed(() => themeDecisions.value.layoutType === "topUserTwoColumn");
// 栏间线颜色与对齐由变量下发，线条贴着两栏交界的中缝。
const mainStyle = computed(() => ({
  "--top-user-divider": themeColorLine.value, // 双栏栏间线颜色
  "--top-user-divider-top": "var(--resume-region-inset-top)", // 栏间线对齐栏内内容的起始位置
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
.top-user-main--two-column :deep(> [data-resume-column]) {
  position: relative;
  box-sizing: border-box;
  align-self: stretch;
}

/* 栏间 1px 细线锚定右栏左边缘（两栏交界的中缝），与标题细分隔线共用同一套线语言。 */
.top-user-main--two-column :deep(> [data-resume-column="right"])::before {
  content: "";
  position: absolute;
  top: calc(-1 * var(--top-user-divider-top, 0px));
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  left: 0; /* 细线贴着右栏左缘，即中缝正中 */
  width: 1px;
  background-color: var(--top-user-divider);
  pointer-events: none;
}
</style>
