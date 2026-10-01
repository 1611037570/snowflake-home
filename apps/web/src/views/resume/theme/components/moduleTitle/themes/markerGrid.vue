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
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 两条纤细笔刷上下错位，以不同长度和透明度保留清晰的叠画层次。 -->
  <div class="flex items-start">
    <h2 class="relative max-w-full min-w-0 font-normal tracking-wide">
      <svg
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 bottom-[0.03em] h-[0.42em] w-full"
        viewBox="0 0 240 24"
        preserveAspectRatio="none"
        :style="{ fill: themeColor }"
      >
        <path d="M0 4L238 0L240 13L3 17Z" fill-opacity="0.65" />
        <path d="M4 11L181 9L179 22L7 24Z" fill-opacity="0.95" />
      </svg>
      <TitleText :title="title" class="relative" />
    </h2>
  </div>
</template>
