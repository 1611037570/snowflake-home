<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor },
} = useResumePreviewContext();
// 弧线沿公共区域上留白绘制，只额外保留头像半高的装饰尺寸。
const arcHeight = "calc(var(--resume-region-inset-top) + 54px)";
// 头像跨在弧线两侧，裁切外观由公共头像组件读取变量。
const appearanceStyle = {
  "--resume-user-avatar-radius": "50%", // 头像取圆形
  "--resume-user-avatar-position": "center top", // 优先保留头像顶部，避免居中裁切截掉头部
};
</script>

<template>
  <!-- 弧形仅作背景，个人信息仍参与正常排版。 -->
  <div class="relative flex w-full min-w-0" :style="appearanceStyle">
    <svg
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-0 w-full"
      viewBox="0 0 1000 156"
      preserveAspectRatio="none"
      :style="{ fill: themeColor, height: arcHeight }"
    >
      <path d="M0 0H1000V116Q500 196 0 116Z" />
    </svg>
    <slot />
  </div>
</template>
