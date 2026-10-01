<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  /** 模块标题文字 */
  title: {
    /** 标题值类型 */
    type: String,
    /** 未传入标题时的默认文字 */
    default: "",
  },
});
const {
  theme: { themeColor, themeColorContrast },
} = useResumePreviewContext();
</script>

<template>
  <!-- 平行斜纹与标题斜边使用相同倾角，预留尾部和折角空间避免遮挡正文。 -->
  <div class="flex items-start pr-[1.2em] pb-[0.45em]" :style="{ color: themeColor }">
    <h2 class="relative max-w-full min-w-0 py-[6px] pr-[2.1em] pl-6 font-bold tracking-wide">
      <span
        aria-hidden="true"
        class="absolute inset-0 bg-current [clip-path:polygon(0_0,calc(100%_-_1.56em)_0,100%_100%,0_100%)]"
      />
      <svg
        aria-hidden="true"
        class="absolute inset-y-0 left-full h-full w-[2.6em] -translate-x-[1.4em] fill-current"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path d="M0 0H8L68 100H60Z" />
        <path d="M16 0H38L98 100H76Z" />
      </svg>
      <svg
        aria-hidden="true"
        class="absolute top-full left-0 h-[0.45em] w-[0.9em] fill-current brightness-75"
        viewBox="0 0 30 15"
        preserveAspectRatio="none"
      >
        <path d="M0 0H30V15Z" />
      </svg>
      <TitleText :title="title" class="relative" :style="{ color: themeColorContrast }" />
    </h2>
  </div>
</template>
