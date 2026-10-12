<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor, themeColorContrast },
} = useResumePreviewContext();
</script>

<template>
  <!-- 首页英文页眉独立占位，不参与个人信息模块的绘制。 -->
  <div
    class="flex h-[72px] w-full min-w-0 items-center overflow-hidden px-9"
    :style="{ backgroundColor: themeColor, color: themeColorContrast }"
  >
    <span class="shrink-0 text-[27px] leading-none font-semibold tracking-[0.12em]">SKIFF RESUME</span>
    <span aria-hidden="true" class="ml-9 h-px min-w-0 flex-1 bg-current opacity-35" />
  </div>
</template>
