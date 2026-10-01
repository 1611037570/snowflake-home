<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import {
  defaultPaddingHorizontal,
  defaultPaddingVertical,
} from "@/stores/modules/resume/config/uiConfig";

// 顶部标语通栏外观：只绘制色带，不改变内容几何。
// 外扩量与内缩量取同一份页面留白，内容盒尺寸与分页测量口径都保持不变。
const {
  ui,
  theme: { themeColor, themeColorContrast },
} = useResumePreviewContext();

const bandStyle = computed(() => {
  const paddingHorizontal = Number(ui.value?.page?.padding?.horizontal) || defaultPaddingHorizontal;
  const paddingVertical = Number(ui.value?.page?.padding?.vertical) || defaultPaddingVertical;
  return {
    // 覆盖区域容器下发的整宽样式，负外边距才能把色带撑到页面边缘
    width: "auto",
    marginTop: `-${paddingVertical}px`,
    marginLeft: `-${paddingHorizontal}px`,
    marginRight: `-${paddingHorizontal}px`,
    paddingTop: `${paddingVertical}px`,
    paddingLeft: `${paddingHorizontal}px`,
    paddingRight: `${paddingHorizontal}px`,
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
