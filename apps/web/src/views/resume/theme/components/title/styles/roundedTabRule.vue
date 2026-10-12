<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 模块显示标题
});
const {
  theme: { themeColor, themeColorContrast, themeColorLine },
} = useResumePreviewContext();
</script>

<template>
  <!-- 圆角标签块：上圆角色块标题，文字颜色按色块底自动取对比色，细线连接右侧正文宽度。 -->
  <div class="flex items-end border-b" :style="{ borderColor: themeColorLine }">
    <h2
      class="rounded-t-xl px-3 py-1.5 font-bold"
      :style="{ backgroundColor: themeColor, color: themeColorContrast }"
    >
      <TitleText :title="title" />
    </h2>
  </div>
</template>
