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
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();
</script>

<template>
  <!-- 复用标题的圆形图标，圆点与细线沿标题中线延伸。 -->
  <div class="flex items-center gap-3">
    <h2 class="max-w-full min-w-0 font-bold tracking-wide">
      <TitleText :title="title" />
    </h2>
    <span
      aria-hidden="true"
      class="h-[0.7em] w-[0.7em] shrink-0 rounded-full"
      :style="{ backgroundColor: themeColor }"
    />
    <span
      aria-hidden="true"
      class="min-w-0 flex-1 border-t"
      :style="{ borderColor: themeColorLine }"
    />
  </div>
</template>
