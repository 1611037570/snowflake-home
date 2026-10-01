<script setup>
import { computed } from "vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 顶部标语内容：标题与标语各自可隐藏，排版由区域外观决定
const {
  data: previewData,
  theme: { fontValue, lineHeightValue },
} = useResumePreviewContext();
const slogan = computed(() => previewData.value?.slogan?.data || {});
const hidden = computed(() => previewData.value?.slogan?.ui || {});
const isFieldHidden = (key) => hidden.value?.[key]?.hidden === true;
</script>

<template>
  <!-- 底部留白计入模块高度，色带下沿据此留出呼吸空间，分页口径同步生效 -->
  <div class="flex max-w-full min-w-0 flex-col items-center gap-3 pb-3 text-center">
    <div
      v-if="slogan.title && !isFieldHidden('title')"
      class="font-bold tracking-wide"
      :style="[fontValue(2), lineHeightValue()]"
    >
      <ResumeField :model-value="slogan.title" />
    </div>
    <div
      v-if="slogan.subtitle && !isFieldHidden('subtitle')"
      class="opacity-80"
      :style="[fontValue(), lineHeightValue()]"
    >
      <ResumeField :model-value="slogan.subtitle" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
