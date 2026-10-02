<script setup>
import { computed } from "vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 普通标语组件只展示简历数据中的文案。
const {
  data: previewData,
  theme: { fontValue, lineHeightValue },
} = useResumePreviewContext();
const slogan = computed(() => previewData.value?.slogan?.data || {});
</script>

<template>
  <div class="flex max-w-full min-w-0 flex-col items-center gap-3 text-center">
    <div v-if="slogan.title" class="font-bold tracking-wide" :style="[fontValue(2), lineHeightValue()]">
      <ResumeField :model-value="slogan.title" />
    </div>
    <div v-if="slogan.subtitle" class="opacity-80" :style="[fontValue(), lineHeightValue()]">
      <ResumeField :model-value="slogan.subtitle" />
    </div>
  </div>
</template>
