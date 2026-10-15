<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 方形色标配一处小缺口，标题使用疏朗的深蓝字距。 -->
  <div class="flex min-h-9 min-w-0 items-center gap-3">
    <span aria-hidden="true" class="relative h-4 w-4 shrink-0" :style="{ backgroundColor: themeColor }">
      <span class="absolute right-0 bottom-0 h-[4px] w-[4px] bg-[#F4C91F]" />
    </span>
    <h2 class="min-w-0 font-extrabold tracking-[0.16em] uppercase break-words text-[#173455]">
      <TitleText :title="title" />
    </h2>
  </div>
</template>
