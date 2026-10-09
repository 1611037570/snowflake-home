<script>
// 页眉留白只在组件里声明一次，区域容器按该声明施加内边距。
const regionPadding = {
  top: 0, // 上边距统一使用页面设置，不叠加主题留白
  right: 0, // 水平留白沿用页面设置
  bottom: 0, // 个人信息与正文之间只使用模块间距
  left: 0, // 水平留白沿用页面设置
};
export default { regionPadding };
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  themeDecisions,
  theme: { themeColorLine },
} = useResumePreviewContext();
// 分栏提示线是双栏版式的装饰，单栏布局下没有分栏，一律不绘制。
const isTwoColumn = computed(() => themeDecisions.value.layoutType === "twoColumn");
// 提示线与正文栏间细线共用同一套线条色，页眉与正文的设计语言保持一致。
const headerStyle = computed(() => ({
  "--user-two-column-line": themeColorLine.value, // 页眉下方的 1px 分栏提示线
  "--user-two-column-offset": "0px", // 提示线贴合区域底边，避免移入正文内容
}));
</script>

<template>
  <!-- 页眉沿用页面边距与模块间距，提示线用绝对定位绘制在区域底边。 -->
  <div
    class="two-column-user relative box-border w-full min-w-0"
    :class="{ 'two-column-user--two-column': isTwoColumn }"
    :style="headerStyle"
  >
    <slot />
  </div>
</template>

<style scoped>
/* 提示线锚定区域底边，不参与排版，也不额外制造高度。 */
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
