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
  <!-- 双三角宽高各收小四像素，宋体标题右侧的细线沿中线延伸。 -->
  <div class="flex items-center gap-3" :style="{ color: themeColor }">
    <svg
      aria-hidden="true"
      class="h-[calc(1.3em-4px)] w-[calc(1.5em-4px)] shrink-0 fill-current"
      viewBox="0 0 60 52"
    >
      <path d="M31 6L60 26L31 46Z" fill-opacity="0.42" />
      <path d="M0 0L36 26L0 52Z" />
    </svg>
    <h2
      class="max-w-full min-w-0 font-[family-name:SimSun,Songti_SC,serif] font-bold tracking-wide"
    >
      <TitleText :title="title" />
    </h2>
    <span aria-hidden="true" class="min-w-0 flex-1 border-t border-current" />
  </div>
</template>
