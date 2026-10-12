<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 个人信息底板使用声明的区域留白，左侧装饰线不占内容宽度。 -->
  <div
    class="relative isolate box-border flex w-full min-w-0"
  >
    <span
      aria-hidden="true"
      class="pointer-events-none absolute -z-10 right-0 bottom-0 left-0"
      :style="{ top: 'var(--resume-page-inset-vertical)', backgroundColor: `color-mix(in srgb, ${themeColor} 8%, #FCFAF7)` }"
    />
    <span
      aria-hidden="true"
      class="pointer-events-none absolute -z-10 bottom-0 left-0 w-[5px]"
      :style="{ top: 'var(--resume-page-inset-vertical)', backgroundColor: themeColor }"
    />
    <slot />
  </div>
</template>
