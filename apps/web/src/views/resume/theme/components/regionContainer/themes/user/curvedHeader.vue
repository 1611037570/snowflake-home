<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { defaultPageRadius, defaultPaddingHorizontal, defaultPaddingVertical } from "@/stores/modules/resume/config/uiConfig";

const {
  ui,
  theme: { themeColor },
} = useResumePreviewContext();
// 弧形页眉自行计算通栏外扩，内容宽度与页面留白保持一致。
const bandStyle = computed(() => {
  const horizontal = Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal);
  const vertical = Number(ui.value?.page?.padding?.vertical ?? defaultPaddingVertical);
  const radius = Number(ui.value?.page?.radius ?? defaultPageRadius);
  return {
    width: "auto",
    marginTop: `-${vertical}px`,
    marginLeft: `-${horizontal}px`,
    marginRight: `-${horizontal}px`,
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
