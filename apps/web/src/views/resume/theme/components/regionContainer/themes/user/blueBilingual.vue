<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
// 页眉底色与个人信息外观变量同在区域外壳声明，公共组件按变量取值。
const appearanceStyle = computed(() => ({
  backgroundColor: themeColor.value, // 页眉底色
  "--resume-user-name-size": "40px", // 姓名字号
  "--resume-user-name-color": "#FFFFFF", // 姓名白色，贴合蓝色页眉
  "--resume-user-avatar-radius": "0", // 头像直角，对应页眉左侧照片区
}));
</script>

<template>
  <!-- 页眉底色覆盖个人信息通栏，内容仍遵守公共页面边距。 -->
  <div class="relative flex w-full min-w-0 text-white" :style="appearanceStyle"><slot /></div>
</template>
