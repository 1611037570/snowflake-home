<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 夹线页头：个人信息区不上底色也不包外框，只用上下两条细线夹出边界。
       内层容器贴住内容本身，两条线才不会跑到区域留白之外。 -->
  <div class="relative box-border w-full min-w-0">
    <div class="relative box-border w-full min-w-0">
      <span
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 top-0 h-px"
        :style="{ backgroundColor: themeColor }"
      />
      <slot />
      <span
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        :style="{ backgroundColor: themeColor }"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
