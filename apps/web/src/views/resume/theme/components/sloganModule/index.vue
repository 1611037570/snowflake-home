<script setup>
import { computed } from "vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { hasThemeSlogan } from "@/views/resume/theme/components/regionContainer/registry";

// 顶部标语内容：标题与标语各占一行，排版与配色由区域外观决定
const {
  data: previewData,
  ui,
  theme: { fontValue, lineHeightValue },
} = useResumePreviewContext();
// 带标语的主题使用组件内置文案，普通内容模板仍展示自身的标语数据。
const slogan = computed(() =>
  hasThemeSlogan(ui.value?.theme?.template)
    ? {
        title: "个人简历", // 主题内置的标语标题
        subtitle: "在追求中发现可能，在创造中实现价值", // 主题内置的标语副标题
      }
    : previewData.value?.slogan?.data || {},
);
</script>

<template>
  <!-- 色带下沿留白由所选区域组件维护，内容组件不自带留白。 -->
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
