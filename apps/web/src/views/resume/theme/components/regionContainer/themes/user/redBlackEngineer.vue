<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  layout,
  theme: { themeColor, themeColorContrast },
} = useResumePreviewContext();
// 页眉分界读取公共栏几何，与正文分割线使用同一位置。
const headerStyle = computed(() => {
  const plan = layout.value;
  const main = plan.regions.find((region) => region.id === "main");
  const left = main?.columns.find((column) => column.id === "left");
  const right = main?.columns.find((column) => column.id === "right");
  const leftRatio = left?.width.value ?? 1;
  const rightRatio = right?.width.value ?? 1;
  const width = plan.pageSize.width - plan.pagePadding.left - plan.pagePadding.right;
  const split =
    plan.pagePadding.left + (width * leftRatio) / (leftRatio + rightRatio);
  return {
    "--red-black-split": `${split}px`, // 页眉红黑分界位置。
    "--red-black-accent": themeColor.value, // 红色页眉背景。
    "--red-black-contrast": themeColorContrast.value, // 姓名区域对比文字色。
    background: `linear-gradient(90deg, ${themeColor.value} ${split}px, #111111 ${split}px)`, // 红黑区域底色。
  };
});
</script>

<template>
  <!-- 颜色分区只绘制背景，留白仍由公共区域容器结算。 -->
  <div class="red-black-header relative flex w-full min-w-0" :style="headerStyle">
    <slot />
  </div>
</template>

<style scoped>
/* 横向黑线只绘图，不额外增加区域高度。 */
.red-black-header::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 9px;
  background: #111111;
  pointer-events: none;
}
</style>
