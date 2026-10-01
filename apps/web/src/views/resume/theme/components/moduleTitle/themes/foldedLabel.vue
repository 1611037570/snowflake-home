<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  /** 模块标题文字 */
  title: {
    /** 标题值类型 */
    type: String,
    /** 未传入标题时的默认文字 */
    default: "",
  },
});
const {
  theme: { themeColor, themeColorContrast },
} = useResumePreviewContext();
</script>

<template>
  <!-- 左下角折片紧贴色块底边，并预留高度避免与正文重叠。 -->
  <div class="flex items-start pb-[0.3em]">
    <h2
      class="relative max-w-full min-w-0 px-6 py-[6px] font-bold tracking-wide"
      :style="{ backgroundColor: themeColor, color: themeColorContrast }"
    >
      <TitleText :title="title" />
      <svg
        aria-hidden="true"
        class="absolute top-full left-0 h-[0.3em] w-[0.75em] fill-sf-text-3 opacity-60"
        viewBox="0 0 30 12"
        preserveAspectRatio="none"
      >
        <path d="M0 0H30V12Z" />
      </svg>
    </h2>
  </div>
</template>
