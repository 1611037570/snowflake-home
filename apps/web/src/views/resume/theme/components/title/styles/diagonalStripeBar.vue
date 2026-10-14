<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { // 当前模块标题
    type: String, // 标题文字类型
    default: "", // 未传入时显示空标题
  },
});
const { theme: { themeColor, themeColorContrast } } = useResumePreviewContext();
</script>

<template>
  <!-- 斜角标题块与通栏浅色斜纹共用同一高度。 -->
  <div
    class="relative flex min-w-0 items-stretch overflow-hidden border-l-[6px]"
    :style="{
      borderColor: 'color-mix(in srgb, ' + themeColor + ' 62%, #1D4D65)',
      backgroundImage: `repeating-linear-gradient(125deg, color-mix(in srgb, ${themeColor} 18%, white) 0 5px, white 5px 10px)`,
    }"
  >
    <h2
      class="relative w-[220px] max-w-[65%] min-w-0 py-1.5 pr-9 pl-9 font-bold tracking-[0.12em] break-words"
      :style="{ backgroundColor: themeColor, color: themeColorContrast, clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0 100%)' }"
    >
      <TitleText :title="title" />
    </h2>
  </div>
</template>
