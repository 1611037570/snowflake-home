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
  <!-- 胶囊标题与右侧细线沿同一中心线排列。 -->
  <div class="flex min-w-0 items-center gap-3">
    <h2
      class="flex max-w-[60%] shrink-0 items-center justify-center rounded-full px-9 py-1.5 font-bold"
      :style="{ backgroundColor: themeColor, color: themeColorContrast }"
    >
      <TitleText :title="title" />
    </h2>
    <span
      aria-hidden="true"
      class="h-px min-w-0 flex-1 bg-gray-300"
      :style="{ display: 'var(--resume-title-decoration-display, block)' }"
    />
  </div>
</template>
