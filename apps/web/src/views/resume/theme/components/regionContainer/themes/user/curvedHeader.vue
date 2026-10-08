<script>
// 页面上边距由引擎注入到区域上留白，弧形背景仍铺到纸张顶边。
const regionPadding = {
  top: 0, // 页面上边距由引擎注入
  right: 0, // 右侧内容留白由栏宽控制
  bottom: 0, // 页眉底部不增加区域留白
  left: 0, // 左侧内容留白由栏宽控制
};
export default {
  regionPadding, // 分页与页眉组件共用的顶部留白
  fillsPageTop: true, // 弧形个人信息页眉从首页纸张顶边铺满整宽
};
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { defaultPageRadius, defaultPaddingHorizontal } from "@/stores/modules/resume/config/uiConfig";

const {
  ui,
  theme: { themeColor },
} = useResumePreviewContext();
// 页面提供通栏位置，弧形页眉只维护水平内缩与顶部圆角。
const bandStyle = computed(() => {
  const horizontal = Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal);
  const radius = Number(ui.value?.page?.radius ?? defaultPageRadius);
  return {
    paddingLeft: `${horizontal}px`,
    paddingRight: `${horizontal}px`,
    borderTopLeftRadius: `${radius}px`,
    borderTopRightRadius: `${radius}px`,
  };
});
// 弧线经过页面上留白后头像的半高处，头像直径由本主题设为 108 像素。
const arcHeight = computed(() => `${regionPadding(ui.value).top + 54}px`);
</script>

<template>
  <!-- 弧形仅作背景，圆角沿用页面设置，个人信息仍参与正常排版。 -->
  <div class="relative flex w-full min-w-0" :style="bandStyle">
    <svg
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-0 w-full [border-radius:inherit]"
      viewBox="0 0 1000 156"
      preserveAspectRatio="none"
      :style="{ fill: themeColor, height: arcHeight }"
    >
      <path d="M0 0H1000V116Q500 196 0 116Z" />
    </svg>
    <slot />
  </div>
</template>
