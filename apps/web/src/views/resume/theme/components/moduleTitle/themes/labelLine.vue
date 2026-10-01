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
  theme: { themeColor, themeColorContrast, themeColorLine },
} = useResumePreviewContext();
</script>

<template>
  <!-- 矩形色块与底部细线相接，标题文字沿用统一字号设置。 -->
  <div class="flex items-end border-b" :style="{ borderColor: themeColorLine }">
    <h2
      class="max-w-full min-w-0 px-5 py-2 font-bold tracking-widest"
      :style="{ backgroundColor: themeColor, color: themeColorContrast }"
    >
      <TitleText :title="title" />
    </h2>
  </div>
</template>
