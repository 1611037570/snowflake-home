<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: {
    type: String, // 模块标题文字类型
    default: "", // 未传入时的标题内容
  },
});
const {
  theme: { themeColor, themeColorContrast },
} = useResumePreviewContext();
</script>

<template>
  <!-- 色块引线：标题色块居左，横线连接右端圆点。 -->
  <div class="flex min-w-0 items-center">
    <h2
      class="max-w-full min-w-0 px-6 py-[3px] font-bold tracking-wide break-words"
      :style="{ backgroundColor: themeColor, color: themeColorContrast }"
    >
      <TitleText :title="title" />
    </h2>
    <span aria-hidden="true" class="h-px min-w-0 flex-1" :style="{ backgroundColor: themeColor }" />
    <span
      aria-hidden="true"
      class="h-3 w-3 shrink-0 rounded-full"
      :style="{ backgroundColor: themeColor }"
    />
  </div>
</template>

<style lang="scss" scoped></style>
