<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 通用个人信息组件居中；外壳只设置排版变量和页眉留白。 -->
  <div
    class="box-border flex w-full min-w-0 justify-center text-center text-[#75859A] [--resume-user-name-size:42px] [--resume-user-name-weight:400] [--resume-user-name-spacing:0.12em] [--resume-user-subtitle-size:14px] [--resume-user-subtitle-color:#75859A] [--resume-user-subtitle-spacing:0.28em] [--resume-user-contact-gap:18px]"
    :style="{ '--resume-user-name-color': themeColor }"
  >
    <slot />
  </div>
</template>
