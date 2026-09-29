<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: {
    type: String,
    default: "",
  },
});
const {
  theme: { themeColor, themeColorContrast, themeColorLine },
} = useResumePreviewContext();
</script>

<template>
  <div class="flex items-baseline" :style="{ background: themeColorLine }">
    <div class="mr-3 w-1 self-stretch" :style="{ background: themeColor }"></div>
    <h2 class="max-w-full min-w-0 font-bold tracking-wide break-words">
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
