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
  <!-- 菱形只属于标题，不参与条目或栏位的排版。 -->
  <h2 class="flex min-h-9 min-w-0 items-center gap-3 font-bold break-words">
    <span aria-hidden="true" class="h-[7px] w-[7px] shrink-0 rotate-45" :style="{ backgroundColor: themeColor }" />
    <TitleText :title="title" />
  </h2>
</template>
