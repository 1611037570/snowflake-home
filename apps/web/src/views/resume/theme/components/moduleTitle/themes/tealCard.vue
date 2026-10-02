<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 模块标题文字
});
const { theme: { themeColor, themeColorLine } } = useResumePreviewContext();
</script>

<template>
  <!-- 圆形图标复用标题公共组件，横线随剩余宽度延伸。 -->
  <div class="flex min-w-0 items-center gap-3 pb-3" :style="{ color: themeColor }">
    <h2 class="min-w-0 font-bold"><TitleText :title="title" /></h2>
    <span class="h-px min-w-0 flex-1" :style="{ backgroundColor: themeColorLine }" aria-hidden="true" />
  </div>
</template>
