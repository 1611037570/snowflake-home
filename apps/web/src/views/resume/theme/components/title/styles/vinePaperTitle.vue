<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
const { theme: { themeColor, themeColorLine } } = useResumePreviewContext();
</script>

<template>
  <!-- 圆点、标题和细底线统一跟随当前主题色。 -->
  <div class="flex min-w-0 items-center gap-3 border-b pb-3" :style="{ borderColor: themeColorLine }">
    <span aria-hidden="true" class="size-[9px] shrink-0 rounded-full" :style="{ backgroundColor: themeColor }" />
    <h2 class="min-w-0 font-serif tracking-[0.12em] break-words" :style="{ color: themeColor }"><TitleText :title="title" /></h2>
  </div>
</template>
