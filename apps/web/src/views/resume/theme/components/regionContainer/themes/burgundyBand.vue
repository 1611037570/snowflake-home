<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import {
  defaultPageRadius,
  defaultPaddingHorizontal,
  defaultPaddingVertical,
} from "@/stores/modules/resume/config/uiConfig";
import { BURGUNDY_BAND_HEIGHT } from "../burgundyBandSize";

const {
  ui,
  theme: { themeColor },
} = useResumePreviewContext();
// 页面边距只用于把固定高度的色带移到纸张边缘，不控制色带内部尺寸。
const bandStyle = computed(() => {
  const vertical = Math.max(0, Number(ui.value?.page?.padding?.vertical ?? defaultPaddingVertical) || 0);
  const horizontal = Math.max(0, Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal) || 0);
  const radius = Math.max(0, Number(ui.value?.page?.radius ?? defaultPageRadius) || 0);
  return {
    width: "auto", // 色带覆盖整张纸的宽度
    height: `${BURGUNDY_BAND_HEIGHT}px`, // 色带固定高度
    marginTop: `-${vertical}px`, // 抵消纸张顶部留白
    marginLeft: `-${horizontal}px`, // 抵消纸张左侧留白
    marginRight: `-${horizontal}px`, // 抵消纸张右侧留白
    paddingLeft: `${horizontal}px`, // 保持标语槽位原有内容宽度
    paddingRight: `${horizontal}px`, // 保持标语槽位原有内容宽度
    borderTopLeftRadius: `${radius}px`, // 左上纸张圆角
    borderTopRightRadius: `${radius}px`, // 右上纸张圆角
    backgroundColor: themeColor.value, // 首页装饰带底色
    backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${themeColor.value} 82%, black), ${themeColor.value})`, // 上深下浅的绛红色带
  };
});
</script>

<template>
  <!-- 装饰独立于标语数据，左右胶片卷轴与菱形点列对应参考样式。 -->
  <div class="relative flex w-full min-w-0 items-center justify-between text-white" :style="bandStyle">
    <div aria-hidden="true" class="absolute left-6 top-1/2 flex -translate-y-1/2 items-center gap-3 opacity-60">
      <svg class="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <circle cx="12" cy="5.5" r="1.5" fill="currentColor" />
        <circle cx="18.2" cy="10" r="1.5" fill="currentColor" />
        <circle cx="15.8" cy="17.4" r="1.5" fill="currentColor" />
        <circle cx="8.2" cy="17.4" r="1.5" fill="currentColor" />
        <circle cx="5.8" cy="10" r="1.5" fill="currentColor" />
      </svg>
      <span v-for="dot in 5" :key="dot" class="h-1 w-1 rotate-45 bg-current" />
    </div>
    <span aria-hidden="true" class="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current opacity-60" />
    <div aria-hidden="true" class="absolute right-6 top-1/2 flex -translate-y-1/2 items-center gap-3 opacity-60">
      <span v-for="dot in 5" :key="dot" class="h-1 w-1 rotate-45 bg-current" />
      <svg class="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <circle cx="12" cy="5.5" r="1.5" fill="currentColor" />
        <circle cx="18.2" cy="10" r="1.5" fill="currentColor" />
        <circle cx="15.8" cy="17.4" r="1.5" fill="currentColor" />
        <circle cx="8.2" cy="17.4" r="1.5" fill="currentColor" />
        <circle cx="5.8" cy="10" r="1.5" fill="currentColor" />
      </svg>
    </div>
    <slot />
  </div>
</template>
