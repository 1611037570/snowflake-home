<script>
// 标语下留白归外观组件维护，分页读取同一份尺寸。
const regionPadding = {
  top: 0, // 标语顶部额外留白
  right: 0, // 标语右侧额外留白
  bottom: 12, // 标语底部色带留白
  left: 0, // 标语左侧额外留白
};
export default { regionPadding /* 标语组件自身的区域留白 */ };
</script>

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
