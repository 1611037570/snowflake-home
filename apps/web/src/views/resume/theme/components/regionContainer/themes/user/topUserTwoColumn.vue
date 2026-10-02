<script>
// 页眉留白同时供真实预览与分页高度计算读取，模板 pt-9 pb-6 与这里保持同一数值。
const regionPadding = {
  top: 36, // 个人信息距区域顶部的留白
  right: 0, // 水平留白沿用页面设置
  bottom: 24, // 个人信息与细分隔线之间 12px、细线与正文之间 12px，合计 24px
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
// 通栏细分隔线只服务个人信息顶部通栏的双栏版式，单栏布局下不绘制。
const isTopUserTwoColumn = computed(() => ui.value?.layout?.type === "topUserTwoColumn");
// 线条颜色与纵向偏移由变量下发，偏移落在底部留白的下半个区间。
const headerStyle = computed(() => ({
  "--top-user-header-line": themeColorLine.value, // 页眉细分隔线颜色
  "--top-user-header-line-offset": "12px", // 细线距页眉内容底边的距离
}));
</script>

<template>
  <!-- 页眉由容器自身补出与 regionPadding 等值的 pt-9 pb-6，细线用绝对定位绘制，不占高度。 -->
  <div
    class="top-user-header relative w-full min-w-0 pt-9 pb-6"
    :class="{ 'top-user-header--rule': isTopUserTwoColumn }"
    :style="headerStyle"
  >
    <slot />
  </div>
</template>

<style scoped>
/* 通栏细分隔线横向铺满页眉宽度，落在页眉内容与双栏正文之间的留白里。 */
.top-user-header--rule::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: var(--top-user-header-line-offset);
  left: 0;
  height: 1px;
  background-color: var(--top-user-header-line);
  pointer-events: none;
}
</style>
