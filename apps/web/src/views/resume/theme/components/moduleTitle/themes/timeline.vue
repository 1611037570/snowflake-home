<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 模块显示标题
});
const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 时间轴模块标题以整行分隔线区分经历分组。 -->
  <div class="border-b-2 pb-3" :style="{ borderColor: themeColor }">
    <h2 class="font-bold tracking-wide"><TitleText :title="title" /></h2>
  </div>
</template>
