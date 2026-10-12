<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 首页装饰独立占位，后续页面由公共分页自然跳过。 -->
  <div class="relative h-[82px] w-full overflow-hidden" :style="{ backgroundColor: themeColor }" aria-hidden="true">
    <span class="absolute inset-y-0 left-[42px] w-[5px] bg-[#C6A46C]" />
    <span class="absolute -top-[62px] right-[112px] h-[210px] w-[210px] rotate-45 border border-white/30" />
    <span class="absolute -top-[86px] right-[37px] h-[210px] w-[210px] rotate-45 border border-white/20" />
  </div>
</template>
