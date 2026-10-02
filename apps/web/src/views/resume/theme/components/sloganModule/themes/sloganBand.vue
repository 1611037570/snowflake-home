<script setup>
import { computed } from "vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { defaultPageRadius } from "@/stores/modules/resume/config/uiConfig";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 标语通栏由文字自然撑高，背景和底线直接绘制在容器上。
const slogan = {
  title: "个人简历", // 色带主标题
  subtitle: "在追求中发现可能，在创造中实现价值", // 色带副标题
};
const {
  ui,
  theme: { fontValue, lineHeightValue, themeColor, themeColorContrast, themeColorLine },
} = useResumePreviewContext();
const bandStyle = computed(() => {
  const radius = Math.max(0, Number(ui.value?.page?.radius ?? defaultPageRadius) || 0);
  // 标语从纸张顶边自然排版，高度由文字和最小高度共同决定。
  return {
    minHeight: "108px", // 保持原有色带的最小视觉高度
    paddingTop: "24px", // 标语文字距色带上沿的内部距离
    paddingBottom: "24px", // 文字与色带下沿保留内部距离
    borderTopLeftRadius: `${radius}px`,
    borderTopRightRadius: `${radius}px`,
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
