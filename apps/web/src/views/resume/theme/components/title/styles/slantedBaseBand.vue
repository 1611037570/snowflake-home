<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 模块标题文字
});
const {
  theme: { themeColor, themeColorContrast },
} = useResumePreviewContext();
</script>

<template>
  <!-- 深色色块压在浅灰底带上，右端斜角只裁剪背景。 -->
  <div class="flex min-w-0 items-end">
    <h2
      class="relative z-10 max-w-[70%] min-w-0 shrink-0 py-[6px] pr-[60px] pl-6 font-bold tracking-wide"
      :style="{
        backgroundColor: themeColor,
        color: themeColorContrast,
        clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 100%, 0 100%)',
      }"
    >
      <TitleText :title="title" />
    </h2>
    <span aria-hidden="true" class="-ml-3 h-[20px] min-w-0 flex-1 bg-[#e6e6e6]" />
  </div>
</template>
