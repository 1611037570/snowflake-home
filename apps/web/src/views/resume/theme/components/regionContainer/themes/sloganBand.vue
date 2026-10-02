<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { resolveBandStyle } from "../bandStyle";

// 顶部标语通栏外观：只绘制色带，不改变内容几何。
// 外扩与留白的算法集中在 bandStyle.ts，与其他通栏色带外观共用同一份口径。
const {
  ui,
  theme: { themeColor, themeColorContrast },
} = useResumePreviewContext();

const bandStyle = computed(() => ({
  ...resolveBandStyle(ui.value, "slogan", { roundTop: true }),
  backgroundColor: themeColor.value,
  color: themeColorContrast.value,
}));
</script>

<template>
  <!-- 色带由区域盒绘制并外扩到页面边缘，内部留白与页面留白等量抵消 -->
  <!-- 区域容器必须保持行方向：栏位用 flex-basis 表达宽度，改成列方向会把它当成高度 -->
  <div class="relative flex w-full min-w-0" :style="bandStyle">
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
