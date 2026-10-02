<script>
import { defaultPaddingVertical as regionDefaultPaddingVertical } from "@/stores/modules/resume/config/uiConfig";

// 个人信息底纹下留白归外观组件维护，分页读取同一份尺寸。
const regionPadding = (ui) => ({
  top: Number(ui?.page?.padding?.vertical ?? regionDefaultPaddingVertical) || 0, // 个人信息顶部内部留白
  right: 0, // 个人信息右侧额外留白
  bottom: 12, // 底纹底部留白
  left: 0, // 个人信息左侧额外留白
});
export default {
  regionPadding, // 个人信息底纹组件自身的区域留白
  fillsPageTop: true, // 个人信息底纹从首页纸张顶边铺满整宽
};
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { defaultPageRadius, defaultPaddingHorizontal, defaultPaddingVertical } from "@/stores/modules/resume/config/uiConfig";

// 个人信息通栏外观：让个人信息整块铺满页面宽度并铺上主题色底纹。
// 页面提供通栏位置，组件只维护底纹和内部留白。
const {
  ui,
  theme: { themeColor, themeColorContrast },
} = useResumePreviewContext();

const bandStyle = computed(() => {
  const horizontal = Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal);
  const vertical = Number(ui.value?.page?.padding?.vertical ?? defaultPaddingVertical);
  const radius = Number(ui.value?.page?.radius ?? defaultPageRadius);
  return {
    paddingTop: `${vertical}px`,
    paddingBottom: "12px",
    paddingLeft: `${horizontal}px`,
    paddingRight: `${horizontal}px`,
    borderTopLeftRadius: `${radius}px`,
    borderTopRightRadius: `${radius}px`,
    backgroundColor: themeColor.value,
    color: themeColorContrast.value,
  };
});
</script>

<template>
  <!-- 区域容器保持行方向：栏位用 flex-basis 表达宽度 -->
  <div class="relative flex w-full min-w-0" :style="bandStyle">
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
