<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 大字页眉与底部分隔线由外壳绘制，资料继续走公共个人信息组件。 -->
  <div
    class="w-full min-w-0 border-b [--resume-user-name-size:54px] [--resume-user-name-weight:400] [--resume-user-subtitle-size:13px] [--resume-user-subtitle-spacing:0.32em] [--resume-user-subtitle-color:#999999] [--resume-user-contact-gap:12px]"
    :style="{ borderColor: themeColor, '--resume-user-name-color': themeColor }"
  >
    <slot />
  </div>
</template>
