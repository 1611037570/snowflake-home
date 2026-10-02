<script>
// 页眉容器不参与引擎加内边距，留白由组件自己声明，并与模板的 pt-9 pb-6 等值。
const regionPadding = {
  top: 36, // 个人信息距区域顶部的留白
  right: 0, // 水平留白沿用页面设置
  bottom: 24, // 个人信息与正文之间的留白，分栏提示线就落在这段留白里
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
// 分栏提示线是双栏版式的装饰，单栏布局下没有分栏，一律不绘制。
const isTwoColumn = computed(() => ui.value?.layout?.type === "twoColumn");
// 提示线与正文栏间细线共用同一套线条色，页眉与正文的设计语言保持一致。
const headerStyle = computed(() => ({
  "--user-two-column-line": themeColorLine.value, // 页眉下方的 1px 分栏提示线
  "--user-two-column-offset": "12px", // 提示线落在底部 24px 留白之内
}));
</script>

<template>
  <!-- 页眉留白由 pt-9 pb-6 表达，且与 regionPadding 同值，提示线用绝对定位绘制。 -->
  <div
    class="two-column-user relative box-border w-full min-w-0 pt-9 pb-6"
    :class="{ 'two-column-user--two-column': isTwoColumn }"
    :style="headerStyle"
  >
    <slot />
  </div>
</template>

<style scoped>
/* 提示线锚定底部留白之内，不参与排版，也不额外制造高度。 */
.two-column-user--two-column::after {
  content: "";
  position: absolute;
  bottom: var(--user-two-column-offset);
  left: 0;
  width: 84px;
  max-width: 100%;
  height: 1px;
  background-color: var(--user-two-column-line);
  pointer-events: none;
}
</style>
