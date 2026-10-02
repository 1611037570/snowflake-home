<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块的标题文字
});
const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 标题靠左，末尾用主题色菱形点缀。 -->
  <div class="burgundy-title flex min-w-0 items-center justify-between gap-3 pb-3">
    <h2 class="min-w-0 font-bold tracking-wide break-words">
      <TitleText :title="title" />
    </h2>
    <div aria-hidden="true" class="burgundy-title__dots flex shrink-0 items-center gap-3" :style="{ color: themeColor }">
      <span v-for="dot in 5" :key="dot" class="h-1 w-1 rotate-45 bg-current" />
    </div>
  </div>
</template>
