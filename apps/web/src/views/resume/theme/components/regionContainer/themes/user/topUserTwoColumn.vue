<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  themeDecisions,
  theme: { themeColorLine },
} = useResumePreviewContext();
// 通栏细分隔线只服务个人信息顶部通栏的双栏版式，单栏布局下不绘制。
const isTopUserTwoColumn = computed(() => themeDecisions.value.layoutType === "topUserTwoColumn");
// 线条颜色与纵向偏移由变量下发，分隔线贴合区域底边。
const headerStyle = computed(() => ({
  "--top-user-header-line": themeColorLine.value, // 页眉细分隔线颜色
  "--top-user-header-line-offset": "0px", // 细线贴合区域底边，避免移入个人信息内容
}));
</script>

<template>
  <!-- 页眉留白由区域容器按 regionPadding 施加，细线用绝对定位绘制，不占高度。 -->
  <div
    class="top-user-header relative w-full min-w-0"
    :class="{ 'top-user-header--rule': isTopUserTwoColumn }"
    :style="headerStyle"
  >
    <slot />
  </div>
</template>

<style scoped>
/* 通栏细分隔线横向铺满页眉宽度，贴合页眉区域底边。 */
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
