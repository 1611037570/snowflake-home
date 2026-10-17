<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
const { theme: { themeColor, themeColorSoft } } = useResumePreviewContext();
</script>

<template>
  <!-- 深色底板让霓虹配色在白色纸张上仍可读，几何尺寸沿用霓虹终端标题。 -->
  <div
    class="min-w-0 border-l-[3px] bg-[#191C22] py-3 pl-3"
    :style="{
      borderColor: themeColor,
      color: themeColor,
      backgroundImage: `linear-gradient(90deg, ${themeColorSoft}, transparent)`,
    }"
  >
    <h2 class="flex min-w-0 items-center break-words">
      <span class="mr-3">//</span><TitleText :title="title" />
    </h2>
  </div>
</template>
