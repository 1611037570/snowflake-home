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
// 标题底板与三道斜纹共用同一斜切角度。
const slantStyle = { transform: "skewX(-15deg)" };
</script>

<template>
  <!-- 斜纹色带：斜切标题右侧接三道由深到浅的斜纹。 -->
  <div class="flex items-center gap-3" :style="{ color: themeColor }">
    <h2 class="relative max-w-full min-w-0 px-5 py-1.5 font-bold tracking-wide">
      <span
        aria-hidden="true"
        class="absolute inset-y-0 right-[0.4em] left-[0.4em] bg-current"
        :style="slantStyle"
      />
      <TitleText :title="title" class="relative" :style="{ color: themeColorContrast }" />
    </h2>
    <span aria-hidden="true" class="flex shrink-0 gap-3">
      <span class="h-[1.4em] w-[0.5em] bg-current" :style="slantStyle" />
      <span class="h-[1.4em] w-[0.5em] bg-current opacity-65" :style="slantStyle" />
      <span class="h-[1.4em] w-[0.5em] bg-current opacity-35" :style="slantStyle" />
    </span>
  </div>
</template>
