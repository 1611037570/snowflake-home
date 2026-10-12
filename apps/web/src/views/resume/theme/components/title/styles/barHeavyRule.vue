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
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 竖条粗线：竖条与底部粗线。 -->
  <div class="border-b-2 pb-3" :style="{ borderColor: themeColor }">
    <div class="flex items-baseline">
      <div class="mr-3 w-1 self-stretch" :style="{ background: themeColor }"></div>
      <h2 class="max-w-full min-w-0 font-bold tracking-wide break-words">
        <TitleText :title="title" />
      </h2>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
