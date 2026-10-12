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
  <!-- 飘带向左伸出一个折角宽度，折角回接正文边缘，底部细线沿标题底边延伸。 -->
  <div
    class="relative -ml-[0.9em] flex items-start pr-[1.2em] pb-[0.45em]"
    :style="{ color: themeColor }"
  >
    <h2 class="relative w-fit max-w-full min-w-0 py-[4px] pr-[2.1em] pl-3 font-bold tracking-wide">
      <!-- 标题底板左缘与内收后的折角左缘对齐。 -->
      <span
        aria-hidden="true"
        class="absolute inset-y-0 right-0 left-[0.1em] bg-current [clip-path:polygon(0_0,calc(100%_-_1.56em)_0,100%_100%,0_100%)]"
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
      <!-- 折角左右各内收并降低高度，避免倒三角伸出过多。 -->
      <svg
        aria-hidden="true"
        class="absolute top-full left-[0.1em] h-[0.35em] w-[0.7em] fill-current brightness-75"
        viewBox="0 0 30 15"
        preserveAspectRatio="none"
      >
        <path d="M0 0H30V15Z" />
      </svg>
      <TitleText :title="title" class="relative" :style="{ color: themeColorContrast }" />
    </h2>
    <!-- 下划线只延伸到标题右侧并贴齐底边，不隔开底板与下方折角。 -->
    <span aria-hidden="true" class="block h-px min-w-0 flex-1 self-end bg-current opacity-60" />
  </div>
</template>
