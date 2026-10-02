<script setup>
import { computed } from "vue";
import { defaultPageRadius } from "@/stores/modules/resume/config/uiConfig";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 绛红标语组件直接占据纸张顶部，并自行绘制装饰带。
const {
  ui,
  theme: { themeColor },
} = useResumePreviewContext();
const bandStyle = computed(() => {
  const radius = Math.max(0, Number(ui.value?.page?.radius ?? defaultPageRadius) || 0);
  return {
    height: "60px", // 装饰带自身的占位高度
    borderTopLeftRadius: `${radius}px`, // 左上纸张圆角
    borderTopRightRadius: `${radius}px`, // 右上纸张圆角
    backgroundColor: themeColor.value, // 装饰带底色
    backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${themeColor.value} 82%, black), ${themeColor.value})`, // 上深下浅的绛红色带
  };
});
</script>

<template>
  <!-- 装饰带自身提供背景和分页占位。 -->
  <div class="relative box-border w-full min-w-0 text-white" :style="bandStyle">
    <div aria-hidden="true" class="pointer-events-none">
      <div class="absolute top-1/2 left-6 flex -translate-y-1/2 items-center gap-3 opacity-60">
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
      <span
        class="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current opacity-60"
      />
      <div class="absolute top-1/2 right-6 flex -translate-y-1/2 items-center gap-3 opacity-60">
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
