<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
const { theme: { themeColor, themeColorSoft, themeColorLine } } = useResumePreviewContext();
</script>

<template>
  <!-- 标题签和虚线共用标题节点高度，手帐纹理保持在文字之后。 -->
  <div class="flex min-w-0 items-end gap-3 pb-3">
    <h2
      class="min-w-0 shrink-0 border-b-2 px-3 font-semibold tracking-[0.08em]"
      :style="{ color: themeColor, backgroundColor: themeColorSoft, borderColor: themeColor }"
    ><TitleText :title="title" /></h2>
    <span aria-hidden="true" class="mb-3 min-w-0 flex-1 border-t border-dashed" :style="{ borderColor: themeColorLine }" />
  </div>
</template>
