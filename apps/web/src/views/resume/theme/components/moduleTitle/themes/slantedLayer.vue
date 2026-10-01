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
  <!-- 背片高度略低并向右错位，斜切标题与延伸细线共用底边。 -->
  <div class="relative flex items-end" :style="{ color: themeColor }">
    <span aria-hidden="true" class="absolute inset-x-0 bottom-0 h-px bg-current opacity-15" />
    <h2
      class="relative max-w-[calc(100%-0.9em)] min-w-0 px-6 py-[6px] font-[family-name:SimSun,Songti_SC,serif] font-bold tracking-wide"
    >
      <span
        aria-hidden="true"
        class="absolute top-[20%] -right-[0.9em] bottom-0 left-0 bg-current opacity-15 [clip-path:polygon(0_0,calc(100%_-_0.45em)_0,100%_100%,0_100%)]"
      />
      <span
        aria-hidden="true"
        class="absolute inset-0 bg-current [clip-path:polygon(0_0,calc(100%_-_0.45em)_0,100%_100%,0_100%)]"
      />
      <TitleText :title="title" class="relative" :style="{ color: themeColorContrast }" />
    </h2>
  </div>
</template>
