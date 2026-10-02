<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块的显示标题
});
const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 标记与正文区域的细线同轴，标题本身仍参与正常排版。 -->
  <div class="relative flex min-h-9 items-center">
    <span
      aria-hidden="true"
      class="pointer-events-none absolute h-9 w-[3px]"
      :style="{ left: 'calc(0px - var(--navy-guide-rail-offset))', backgroundColor: themeColor }"
    />
    <h2 class="min-w-0 font-bold tracking-wide break-words"><TitleText :title="title" /></h2>
  </div>
</template>
