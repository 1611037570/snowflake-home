<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 圆形以正文区域为定位基准，背景层不改变正文排版。 -->
  <div class="resume-view-container relative box-border flex min-w-0 bg-transparent text-inherit">
    <div
      aria-hidden="true"
      class="teal-ribbon-main-decoration pointer-events-none absolute inset-y-0 left-0 overflow-hidden"
      :style="{ right: 'calc(-1 * var(--resume-page-inset-horizontal, 0px))' }"
    >
      <span
        class="absolute top-[120px] -right-[68px] h-[120px] w-[120px] rounded-full opacity-40"
        :style="{ backgroundColor: themeColor }"
      />
      <span
        class="absolute top-[36px] -right-[68px] h-[120px] w-[120px] rounded-full"
        :style="{ backgroundColor: themeColor }"
      />
    </div>
    <slot />
  </div>
</template>

<style scoped>
/* 右上角圆形仅随第一页正文出现。 */
:global(.resume-page-item:not([data-page-index="0"])) .teal-ribbon-main-decoration {
  display: none;
}
</style>
