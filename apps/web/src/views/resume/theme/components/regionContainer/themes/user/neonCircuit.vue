<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
// 个人信息沿用公共排布，本主题只下发霓虹配色的文字样式变量。
const appearanceStyle = computed(() => ({
  "--resume-user-name-size": "48px", // 姓名字号
  "--resume-user-name-line-height": "1.1", // 姓名行高倍数
  "--resume-user-name-spacing": "0.07em", // 姓名额外字距
  "--resume-user-name-color": "#f4fffe", // 姓名近白
  "--resume-user-name-family": 'Consolas, "Courier New", monospace', // 姓名等宽字体
  "--resume-user-name-shadow": `0 0 8px ${themeColor.value}`, // 姓名辉光跟随主题色
  "--resume-user-subtitle-color": themeColor.value, // 副标题跟随主题色
  "--resume-user-subtitle-size": "16px", // 副标题字号
  "--resume-user-subtitle-spacing": "0.1em", // 副标题字距
  "--resume-user-subtitle-family": 'Consolas, "Courier New", monospace', // 副标题等宽字体
  "--resume-user-subtitle-shadow": `0 0 8px ${themeColor.value}`, // 副标题辉光跟随主题色
  "--resume-user-contact-gap": "6px", // 资料行距
  "--resume-user-contact-label-color": themeColor.value, // 标签跟随主题色
}));
</script>

<template>
  <!-- 外壳只声明外观变量，盒模型与公共个人信息区域保持一致。 -->
  <div :style="appearanceStyle">
    <slot />
  </div>
</template>
