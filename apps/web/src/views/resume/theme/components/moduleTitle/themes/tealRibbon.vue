<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: {
    type: String,
    default: "",
  },
});
const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 旗帜只绘制背景，标题仍占用常规布局高度。 -->
  <div class="relative flex w-fit max-w-[calc(100%-60px)] min-w-0 items-center">
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-y-0 -right-[60px]"
      :style="{
        left: 'calc(-1 * var(--resume-page-inset-horizontal, 0px))',
        backgroundColor: themeColor,
        clipPath: 'polygon(0 0, 100% 0, calc(100% - 18px) 50%, 100% 100%, 0 100%)',
      }"
    />
    <h2 class="relative min-w-0 py-[6px] pl-[12px] font-bold tracking-wide break-words text-white">
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
