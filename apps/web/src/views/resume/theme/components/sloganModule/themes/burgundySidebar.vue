<script setup>
import { computed } from "vue";
import {
  defaultPageRadius,
  defaultPaddingHorizontal,
  defaultPaddingVertical,
} from "@/stores/modules/resume/config/uiConfig";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 绛红标语组件自行维护装饰带和它在页面内容区内的占位。
const bandHeight = 60;
const {
  ui,
  theme: { themeColor },
} = useResumePreviewContext();
const bandStyle = computed(() => {
  const vertical = Math.max(0, Number(ui.value?.page?.padding?.vertical ?? defaultPaddingVertical) || 0);
  const horizontal = Math.max(0, Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal) || 0);
  const radius = Math.max(0, Number(ui.value?.page?.radius ?? defaultPageRadius) || 0);
  return {
    width: "auto", // 色带覆盖整张纸的宽度
    height: `${Math.max(0, bandHeight - vertical)}px`, // 内容区内的色带占位
    marginLeft: `-${horizontal}px`, // 色带向左铺到纸张边缘
    marginRight: `-${horizontal}px`, // 色带向右铺到纸张边缘
    "--burgundy-band-top": `${vertical}px`, // 背景向上铺到纸张顶边的距离
    "--burgundy-band-height": `${bandHeight}px`, // 色带固定视觉高度
    "--burgundy-band-radius": `${radius}px`, // 色带顶部沿用纸张圆角
  };
});
const backgroundStyle = computed(() => ({
  top: "calc(-1 * var(--burgundy-band-top))", // 背景从内容区向上延伸
  height: "var(--burgundy-band-height)", // 装饰背景保持固定高度
  borderTopLeftRadius: "var(--burgundy-band-radius)", // 左上纸张圆角
  borderTopRightRadius: "var(--burgundy-band-radius)", // 右上纸张圆角
  backgroundColor: themeColor.value, // 装饰带底色
  backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${themeColor.value} 82%, black), ${themeColor.value})`, // 上深下浅的绛红色带
}));
</script>

<template>
  <!-- 装饰和分页占位由同一个标语节点提供。 -->
  <div class="relative box-border w-full min-w-0 text-white" :style="bandStyle">
    <div aria-hidden="true" class="pointer-events-none absolute inset-x-0" :style="backgroundStyle">
      <div class="absolute left-6 top-1/2 flex -translate-y-1/2 items-center gap-3 opacity-60">
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
      <span class="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current opacity-60" />
      <div class="absolute right-6 top-1/2 flex -translate-y-1/2 items-center gap-3 opacity-60">
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
    </div>
  </div>
</template>
