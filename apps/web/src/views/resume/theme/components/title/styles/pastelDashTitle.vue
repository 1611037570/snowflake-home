<script setup>
import { computed } from "vue";
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
const { theme: { themeColor } } = useResumePreviewContext();
// 虚线由标题组件自身绘制，离开完整主题也能独立使用。
const dashStyle = computed(() => ({
  backgroundImage: `repeating-linear-gradient(90deg, color-mix(in srgb, ${themeColor.value} 42%, transparent) 0 14px, transparent 14px 23px)`,
}));
</script>

<template>
  <!-- 楷体标题与加粗虚线共同组成完整标题，沿用公共标题文字组件。 -->
  <div class="flex min-w-0 items-center gap-3 pb-3">
    <h2 class="min-w-0 shrink-0 font-bold tracking-[0.12em]" :style="{ color: themeColor, fontFamily: 'KaiTi, STKaiti, Kaiti SC, serif' }"><TitleText :title="title" /></h2>
    <span aria-hidden="true" class="h-[4px] min-w-0 flex-1" :style="dashStyle" />
  </div>
</template>
