<script setup>
import { computed } from "vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 标语通栏由文字自然撑高，底边线计入下侧留白。
const slogan = {
  title: "个人简历", // 色带主标题
  subtitle: "在追求中发现可能，在创造中实现价值", // 色带副标题
};
const {
  theme: { fontValue, lineHeightValue, themeColor, themeColorContrast, themeColorLine },
} = useResumePreviewContext();
const bandStyle = computed(() => {
  // 标语由文字自然撑高，底边线与下内边距合计等于上内边距。
  return {
    paddingTop: "24px", // 标语文字距色带上沿的内部距离
    paddingBottom: "20px", // 与四像素底边线合计二十四像素留白
    borderBottom: `4px solid ${themeColorLine.value}`, // 色带下沿的装饰细线
    backgroundColor: themeColor.value, // 色带背景色
    color: themeColorContrast.value, // 标语文字颜色
  };
});
</script>

<template>
  <div class="box-border w-full min-w-0" :style="bandStyle">
    <div class="flex max-w-full min-w-0 flex-col items-center gap-3 text-center">
      <div class="font-bold tracking-wide" :style="[fontValue(2), lineHeightValue()]">
        <ResumeField :model-value="slogan.title" />
      </div>
      <div class="opacity-80" :style="[fontValue(), lineHeightValue()]">
        <ResumeField :model-value="slogan.subtitle" />
      </div>
    </div>
  </div>
</template>
