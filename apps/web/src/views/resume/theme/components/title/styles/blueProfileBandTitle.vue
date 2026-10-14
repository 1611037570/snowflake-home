<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 模块标题文字
});
const {
  theme: { themeColor, themeColorContrast },
} = useResumePreviewContext();
</script>

<template>
  <!-- 深蓝胶囊覆盖浅蓝圆角横带的左端。 -->
  <div class="flex min-w-0 rounded-full bg-[#EEF2FF]">
    <h2
      class="flex min-h-[40px] max-w-[60%] shrink-0 items-center rounded-full px-6 font-bold"
      :style="{ backgroundColor: themeColor, color: themeColorContrast }"
    >
      <TitleText :title="title" />
    </h2>
  </div>
</template>
