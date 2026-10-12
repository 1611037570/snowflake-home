<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 正文容器接住剩余空间，纵线在同一容器内绘制。 -->
  <div class="resume-view-container relative box-border flex min-w-0">
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-y-0 left-0 w-px opacity-30"
      :style="{ backgroundColor: themeColor }"
    />
    <slot />
  </div>
</template>
