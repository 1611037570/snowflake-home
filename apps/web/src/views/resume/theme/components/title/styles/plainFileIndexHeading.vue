<script setup>
import NumberedPrefix from "./numberedPrefix.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { // 当前模块标题
    type: String, // 标题文字类型
    default: "", // 标题缺省值
  },
});
const { theme: { themeColorLine } } = useResumePreviewContext();
</script>

<template>
  <!-- 极简版由标题自身绘制公共序号，脱离档案主题的模块外框也能完整呈现。 -->
  <div class="flex min-w-0 items-center gap-3 pb-3">
    <NumberedPrefix :title="title" />
    <span aria-hidden="true" class="h-px min-w-0 flex-1" :style="{ backgroundColor: themeColorLine }" />
  </div>
</template>
