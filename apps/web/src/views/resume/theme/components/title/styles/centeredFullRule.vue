<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块的标题文字
});
const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 居中通栏底线：标题居中落在内容宽度内，下方一条同色通栏横线分隔正文。 -->
  <div class="flex flex-col items-center">
    <h2 class="max-w-full min-w-0 pb-3 font-bold break-words" :style="{ color: themeColor }">
      <TitleText :title="title" />
    </h2>
    <span aria-hidden="true" class="h-[2px] w-full" :style="{ background: themeColor }"></span>
  </div>
</template>
