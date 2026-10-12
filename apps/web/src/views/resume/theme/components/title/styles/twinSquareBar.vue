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
  <!-- 双方块条：两个主题色小块与标题块保持相同间隙，标题文字按块底自动取对比色，文字与图标复用公共组件。 -->
  <div class="flex items-stretch" :style="{ backgroundColor: themeColorSoft }">
    <span
      aria-hidden="true"
      class="mr-[6px] w-3 shrink-0"
      :style="{ backgroundColor: themeColor }"
    />
    <span
      aria-hidden="true"
      class="mr-[6px] w-3 shrink-0"
      :style="{ backgroundColor: themeColor }"
    />
    <h2
      class="max-w-full min-w-0 px-[24px] py-[6px] font-bold tracking-wide break-words"
      :style="{ backgroundColor: themeColor, color: themeColorContrast }"
    >
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
