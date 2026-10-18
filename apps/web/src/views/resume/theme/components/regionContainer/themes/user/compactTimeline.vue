<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 个人信息沿用公共组件，只用姓名、头像和底线呼应年表配色。 -->
  <div class="compact-timeline-user relative flex w-full min-w-0" :style="{ '--compact-user-color': themeColor }">
    <slot />
  </div>
</template>

<style scoped>
.compact-timeline-user {
  --resume-user-name-size: 40px;
  --resume-user-name-line-height: 1.1;
  --resume-user-name-color: color-mix(in srgb, var(--compact-user-color) 78%, black);
  --resume-user-avatar-radius: 50%;
  --resume-user-subtitle-color: var(--compact-user-color);
}

/* 页眉收口线改用独立绘制层贴合区域底边：box-shadow 内阴影在缩放预览下会在左右两侧露出 1px 细边。 */
.compact-timeline-user::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  background-color: var(--compact-user-color);
  pointer-events: none;
}
</style>
