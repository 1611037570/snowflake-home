<script>
// 经典正文留白：上下留出双细线所在的空间，左右沿用页面设置，分页读取同一份数值。
const regionPadding = {
  top: 18, // 上细线与正文之间的留白
  right: 0, // 右侧留白沿用页面设置
  bottom: 18, // 末条正文与下细线之间的留白
  left: 0, // 左侧留白沿用页面设置
};
export default {
  regionPadding, // 引擎按此自动加内边距，组件本身不再声明留白
};
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColorLine },
} = useResumePreviewContext();
// 细线越过容器内边距，锚在正文内容区上下沿的外侧，不占用内容高度。
const topLineStyle = computed(() => ({
  top: `${-6 - regionPadding.top}px`, // 上细线相对内容区上沿的位置
  backgroundColor: themeColorLine.value, // 细线颜色由主题色派生
}));
const bottomLineStyle = computed(() => ({
  bottom: `${-6 - regionPadding.bottom}px`, // 下细线相对内容区下沿的位置
  backgroundColor: themeColorLine.value, // 细线颜色由主题色派生
}));
</script>

<template>
  <!-- 经典正文区域：留白由引擎下发，只画上下双细线，栏内不铺任何底色。 -->
  <div class="classic-main">
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 h-px"
      :style="topLineStyle"
    />
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 h-px"
      :style="bottomLineStyle"
    />
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
