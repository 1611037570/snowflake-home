<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
const { theme: { themeColor, themeColorContrast } } = useResumePreviewContext();
</script>

<template>
  <!-- 便签颜色统一跟随当前主题色，标题宽度始终贴合真实文字。 -->
  <div class="box-border min-w-0 pb-3">
    <h2
      class="inline-flex max-w-full min-w-0 items-center px-3 py-3 text-[20px] leading-none font-bold"
      :style="{ backgroundColor: themeColor, color: themeColorContrast }"
    >
      <TitleText :title="title" />
    </h2>
  </div>
</template>
