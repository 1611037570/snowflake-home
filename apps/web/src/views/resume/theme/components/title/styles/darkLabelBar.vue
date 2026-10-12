<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: {
    type: String,
    default: "",
  },
});
const {
  theme: { themeColor, themeColorSoft, themeColorContrast },
} = useResumePreviewContext();
</script>

<template>
  <!-- 深色标签条：外层浅色底条与主题色标签，文字颜色按标签底自动取对比色，标题文字与图标复用公共组件。 -->
  <div class="flex" :style="{ backgroundColor: themeColorSoft }">
    <h2
      class="max-w-full min-w-0 px-[18px] py-[6px] font-bold tracking-wide break-words"
      :style="{ backgroundColor: themeColor, color: themeColorContrast }"
    >
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
