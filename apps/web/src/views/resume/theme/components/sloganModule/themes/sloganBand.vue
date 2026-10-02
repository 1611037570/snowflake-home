<script setup>
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 标语通栏的文案由主题组件自身提供。
const slogan = {
  title: "个人简历", // 色带主标题
  subtitle: "在追求中发现可能，在创造中实现价值", // 色带副标题
};
const {
  theme: { fontValue, lineHeightValue },
} = useResumePreviewContext();
</script>

<template>
  <div class="slogan-band-space relative w-full">
    <!-- 文字按色带组件提供的位置绘制，占位按同一高度参与分页。 -->
    <div class="slogan-band-content absolute inset-x-0 flex flex-col items-center gap-3 text-center">
      <div class="font-bold tracking-wide" :style="[fontValue(2), lineHeightValue()]">
        <ResumeField :model-value="slogan.title" />
      </div>
      <div class="opacity-80" :style="[fontValue(), lineHeightValue()]">
        <ResumeField :model-value="slogan.subtitle" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.slogan-band-space {
  height: max(0px, calc(var(--slogan-band-height) - var(--slogan-band-page-top)));
}

.slogan-band-content {
  top: calc(var(--slogan-band-content-top) - var(--slogan-band-page-top));
}
</style>
