<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColorSoft },
} = useResumePreviewContext();
// 个人信息沿用公共左文右像排布，本主题只下发姓名、头像与副标题的外观变量。
const appearanceStyle = computed(() => ({
  "--resume-user-name-size": "38px", // 姓名字号
  "--resume-user-name-line-height": "1.15", // 姓名行高倍数
  "--resume-user-avatar-radius": "0", // 头像不收圆角
  "--resume-user-avatar-border": "6px solid #E8F4F8", // 头像浅色描边
  "--resume-user-subtitle-background": themeColorSoft.value, // 副标题底纹色
  "--resume-user-subtitle-color": "#326B85", // 副标题文字色
  "--resume-user-subtitle-padding": "6px 12px", // 副标题底纹内留白
}));
</script>

<template>
  <!-- 外壳只声明外观变量，盒模型与公共个人信息区域保持一致。 -->
  <div :style="appearanceStyle">
    <slot />
  </div>
</template>
