<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
const { theme: { themeColor, themeColorContrast } } = useResumePreviewContext();
</script>

<template>
  <!-- 蓝色标题签从模块线框左上角内收，留白计入标题自身高度。 -->
  <div class="min-w-0 pt-[9px] pl-[6px] pb-3">
    <h2 class="inline-block max-w-full min-w-0 rounded-lg px-3 py-[6px] font-bold break-words" :style="{ backgroundColor: themeColor, color: themeColorContrast }"><TitleText :title="title" /></h2>
  </div>
</template>
