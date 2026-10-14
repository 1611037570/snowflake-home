<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 疏朗的衬线标题和一像素底线由标题节点完整绘制。 -->
  <h2 class="min-w-0 border-b pb-3 font-serif font-medium tracking-[0.32em] break-words" :style="{ color: '#3D5650', borderColor: themeColor }"><TitleText :title="title" /></h2>
</template>
