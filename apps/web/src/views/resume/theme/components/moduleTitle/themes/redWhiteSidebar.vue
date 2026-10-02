<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块的标题文字
});
const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 左栏配色由正文外观继承，右栏默认显示主题色文字与横线。 -->
  <h2
    class="red-white-title min-w-0 border-b pb-3 font-bold break-words"
    :style="{ color: `var(--red-sidebar-title, ${themeColor})`, borderColor: 'currentColor' }"
  >
    <TitleText :title="title" />
  </h2>
</template>
