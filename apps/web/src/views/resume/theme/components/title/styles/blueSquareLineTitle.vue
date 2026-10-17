<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({ title: { type: String, default: "" } }); // 当前模块标题
const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 标题、细线与末端方块统一跟随当前主题色。 -->
  <div class="flex min-w-0 items-center gap-6 pb-3" :style="{ color: themeColor }">
    <h2 class="shrink-0 text-[18px] font-semibold"><TitleText :title="title" /></h2>
    <span aria-hidden="true" class="h-px min-w-0 flex-1 bg-current" />
    <span aria-hidden="true" class="-ml-6 h-3 w-3 shrink-0 bg-current" />
  </div>
</template>
