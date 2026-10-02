<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块的显示标题
});
const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 标题节点与横线仅作装饰，不改变模块内容的排版顺序。 -->
  <div class="teal-rail-title relative flex min-w-0 items-center gap-3 pb-3">
    <span
      aria-hidden="true"
      class="teal-rail-title__dot pointer-events-none absolute h-[9px] w-[9px] rounded-full"
      :style="{ left: 'calc(-1 * var(--teal-rail-title-offset) - 5px)', backgroundColor: themeColor }"
    />
    <h2 class="min-w-0 shrink-0 font-bold tracking-wide break-words"><TitleText :title="title" /></h2>
    <span aria-hidden="true" class="teal-rail-title__line h-px min-w-0 flex-1 bg-gray-200" />
  </div>
</template>
