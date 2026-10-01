<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import {
  defaultPaddingHorizontal,
  defaultPaddingVertical,
} from "@/stores/modules/resume/config/uiConfig";
import { resolveRegionPadding } from "@/views/resume/theme/regionPadding";

// 顶部标语通栏外观：只绘制色带，不改变内容几何。
// 页面留白用等量负外边距外扩、等量内边距收回；区域留白则只作为内边距，
// 与引擎扣除的那份声明同源，因此色带可以铺满页面而内容盒宽度保持引擎口径。
const {
  ui,
  theme: { themeColor, themeColorContrast },
} = useResumePreviewContext();

const bandStyle = computed(() => {
  const paddingHorizontal = Number(ui.value?.page?.padding?.horizontal) || defaultPaddingHorizontal;
  const paddingVertical = Number(ui.value?.page?.padding?.vertical) || defaultPaddingVertical;
  const regionPadding = resolveRegionPadding(ui.value, "slogan");
  return {
    // 覆盖区域容器下发的整宽样式，负外边距才能把色带撑到页面边缘
    width: "auto",
    marginTop: `-${paddingVertical}px`,
    marginLeft: `-${paddingHorizontal}px`,
    marginRight: `-${paddingHorizontal}px`,
    paddingTop: `${paddingVertical + regionPadding.top}px`,
    paddingBottom: `${regionPadding.bottom}px`,
    paddingLeft: `${paddingHorizontal + regionPadding.left}px`,
    paddingRight: `${paddingHorizontal + regionPadding.right}px`,
    backgroundColor: themeColor.value,
    color: themeColorContrast.value,
    // 与页面外壳圆角保持一致，避免色带方角盖住页面圆角
    borderTopLeftRadius: "24px",
    borderTopRightRadius: "24px",
  };
});
</script>

<template>
  <!-- 色带由区域盒绘制并外扩到页面边缘，内部留白与页面留白等量抵消 -->
  <!-- 区域容器必须保持行方向：栏位用 flex-basis 表达宽度，改成列方向会把它当成高度 -->
  <div class="relative flex w-full min-w-0" :style="bandStyle">
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
