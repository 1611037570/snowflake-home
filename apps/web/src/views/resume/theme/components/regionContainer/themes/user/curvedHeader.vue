<script>
import { defaultPaddingVertical as regionDefaultPaddingVertical } from "@/stores/modules/resume/config/uiConfig";

const regionPadding = (ui) => ({
  top: Number(ui?.page?.padding?.vertical ?? regionDefaultPaddingVertical) || 0, // 页眉内容顶部内部留白
  right: 0, // 右侧内容留白由栏宽控制
  bottom: 0, // 页眉底部不增加区域留白
  left: 0, // 左侧内容留白由栏宽控制
});
export default {
  regionPadding, // 分页与页眉组件共用的顶部留白
  fillsPageTop: true, // 弧形个人信息页眉从首页纸张顶边铺满整宽
};
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { defaultPageRadius, defaultPaddingHorizontal, defaultPaddingVertical } from "@/stores/modules/resume/config/uiConfig";

const {
  ui,
  theme: { themeColor },
} = useResumePreviewContext();
// 页面提供通栏位置，弧形页眉只维护自身内容留白。
const bandStyle = computed(() => {
  const horizontal = Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal);
  const vertical = Number(ui.value?.page?.padding?.vertical ?? defaultPaddingVertical);
  const radius = Number(ui.value?.page?.radius ?? defaultPageRadius);
  return {
    paddingTop: `${vertical}px`,
    paddingLeft: `${horizontal}px`,
    paddingRight: `${horizontal}px`,
    borderTopLeftRadius: `${radius}px`,
    borderTopRightRadius: `${radius}px`,
  };
});
</script>

<template>
  <!-- 弧形仅作背景，圆角沿用页面设置，个人信息仍参与正常排版。 -->
  <div class="relative flex w-full min-w-0" :style="bandStyle">
    <svg
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-0 h-[126px] w-full [border-radius:inherit]"
      viewBox="0 0 1000 156"
      preserveAspectRatio="none"
      :style="{ fill: themeColor }"
    >
      <path d="M0 0H1000V116Q500 196 0 116Z" />
    </svg>
    <slot />
  </div>
</template>
