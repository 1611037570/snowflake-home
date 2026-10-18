<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
// 头像偏移衬边由公共组件读取变量，衬边不占排版尺寸。
const appearanceStyle = computed(() => ({
  "--resume-user-avatar-radius": "0", // 头像直角
  "--resume-user-avatar-shadow": `6px 6px 0 ${themeColor.value}`, // 头像右下方的主题色衬边
}));
</script>

<template>
  <div class="relative flex w-full min-w-0" :style="appearanceStyle">
    <slot />
  </div>
</template>
