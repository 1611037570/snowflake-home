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
  <!-- 三层箭头共用高度，浅色箭尖衔接通栏底纹，文字独立置于实色标题之上。 -->
  <div class="relative flex items-center" :style="{ color: themeColor }">
    <span
      aria-hidden="true"
      class="absolute inset-0 bg-current opacity-10 [clip-path:polygon(0_0,calc(100%_-_0.6em)_0,100%_50%,calc(100%_-_0.6em)_100%,0_100%)]"
    />
    <h2
      class="relative max-w-[calc(100%-0.6em)] min-w-0 px-6 py-[3px] font-[family-name:SimSun,Songti_SC,serif] font-bold tracking-wide"
    >
      <span
        aria-hidden="true"
        class="absolute inset-y-0 -right-[0.6em] left-0 bg-current opacity-30 [clip-path:polygon(0_0,calc(100%_-_0.6em)_0,100%_50%,calc(100%_-_0.6em)_100%,0_100%)]"
      />
      <span
        aria-hidden="true"
        class="absolute inset-0 bg-current [clip-path:polygon(0_0,calc(100%_-_0.6em)_0,100%_50%,calc(100%_-_0.6em)_100%,0_100%)]"
      />
      <TitleText :title="title" class="relative" :style="{ color: themeColorContrast }" />
    </h2>
  </div>
</template>
