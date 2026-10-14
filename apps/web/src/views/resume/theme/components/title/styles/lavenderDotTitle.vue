<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 方点与标题在自身节点完整绘制，独立标题主题可直接复用。 -->
  <div
    class="flex min-w-0 items-center gap-3 pb-3"
    :style="{ paddingTop: 'var(--lavender-title-top, 0px)', paddingLeft: 'var(--lavender-title-inset, 0px)', paddingRight: 'var(--lavender-title-inset, 0px)' }"
  >
    <span aria-hidden="true" class="h-3 w-3 shrink-0 rounded-[3px] bg-gradient-to-br from-[#A77BFF] to-[#ED8DD2]" />
    <h2 class="min-w-0 font-semibold tracking-wide break-words" :style="{ color: themeColor }"><TitleText :title="title" /></h2>
  </div>
</template>
