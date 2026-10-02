<script setup>
import { computed } from "vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { defaultPageRadius } from "@/stores/modules/resume/config/uiConfig";

// 普通标语组件同时维护数据文案与通栏背景。
const {
  data: previewData,
  ui,
  theme: { fontValue, lineHeightValue, themeColor, themeColorContrast },
} = useResumePreviewContext();
const slogan = computed(() => previewData.value?.slogan?.data || {});
const bandStyle = computed(() => {
  // 标语区域直接占据纸张顶部，文字留白由组件自身维护。
  const radius = Number(ui.value?.page?.radius ?? defaultPageRadius);
  return {
    paddingTop: "24px",
    paddingBottom: "12px",
    paddingLeft: "24px",
    paddingRight: "24px",
    borderTopLeftRadius: `${radius}px`,
    borderTopRightRadius: `${radius}px`,
    backgroundColor: themeColor.value,
    color: themeColorContrast.value,
  };
});
</script>

<template>
  <div class="box-border w-full min-w-0" :style="bandStyle">
    <div class="flex max-w-full min-w-0 flex-col items-center gap-3 text-center">
      <div v-if="slogan.title" class="font-bold tracking-wide" :style="[fontValue(2), lineHeightValue()]">
        <ResumeField :model-value="slogan.title" />
      </div>
      <div v-if="slogan.subtitle" class="opacity-80" :style="[fontValue(), lineHeightValue()]">
        <ResumeField :model-value="slogan.subtitle" />
      </div>
    </div>
  </div>
</template>
