<script setup>
import { computed } from "vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 顶部标语内容：标题与标语各占一行，排版与配色由区域外观决定
const {
  data: previewData,
  theme: { fontValue, lineHeightValue },
} = useResumePreviewContext();
const slogan = computed(() => previewData.value?.slogan?.data || {});
</script>

<template>
  <!-- 色带下沿留白由区域留白声明承担，内容组件不自带留白 -->
  <div class="flex max-w-full min-w-0 flex-col items-center gap-3 text-center">
    <div
      v-if="slogan.title"
      class="font-bold tracking-wide"
      :style="[fontValue(2), lineHeightValue()]"
    >
      <ResumeField :model-value="slogan.title" />
    </div>
    <div v-if="slogan.subtitle" class="opacity-80" :style="[fontValue(), lineHeightValue()]">
      <ResumeField :model-value="slogan.subtitle" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
