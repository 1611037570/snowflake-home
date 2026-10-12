<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor, themeColorContrast },
} = useResumePreviewContext();
</script>

<template>
  <!-- 斜切色面与帆影只绘制首页页眉，个人信息继续使用公共组件。 -->
  <div class="relative h-[120px] w-full min-w-0 overflow-hidden bg-white" :style="{ color: themeColor }">
    <div
      aria-hidden="true"
      class="absolute inset-y-0 left-0 w-[69%]"
      :style="{ backgroundColor: themeColor, clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)' }"
    />
    <div class="relative flex h-full items-center px-12" :style="{ color: themeColorContrast }">
      <div class="flex flex-col gap-3">
        <span class="text-[37px] leading-none font-semibold tracking-[0.16em]">SKIFF</span>
        <span class="text-[12px] leading-none font-medium tracking-[0.48em]">RESUME</span>
      </div>
    </div>
    <svg
      aria-hidden="true"
      class="absolute top-3 right-12 h-[96px] w-[96px] opacity-70"
      viewBox="0 0 96 96"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M48 9V77M43 19L20 69H43V19ZM53 12L77 69H53V12Z" stroke-width="1.5" />
      <path d="M17 78H79M25 84C39 89 57 89 71 84" stroke-width="1.5" />
    </svg>
  </div>
</template>
