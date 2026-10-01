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
  <!-- 标题右端斜切，左端与模块竖线对齐。 -->
  <div class="flex items-start">
    <h2
      class="angled-title max-w-full min-w-0 px-6 py-2 pr-9 font-bold tracking-wide"
      :style="{ backgroundColor: themeColor, color: themeColorContrast }"
    >
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style scoped>
/* 斜切仅裁剪标题色块，不改变测量与分页时的占位。 */
.angled-title {
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%);
}
</style>
