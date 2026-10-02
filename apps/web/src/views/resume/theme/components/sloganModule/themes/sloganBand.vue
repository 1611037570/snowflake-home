<script setup>
import { computed } from "vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { defaultPageRadius, defaultPaddingHorizontal, defaultPaddingVertical } from "@/stores/modules/resume/config/uiConfig";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 标语通栏在一个组件中维护装饰、固定文案和分页占位。
const bandHeight = 108;
const slogan = {
  title: "个人简历", // 色带主标题
  subtitle: "在追求中发现可能，在创造中实现价值", // 色带副标题
};
const {
  ui,
  theme: { fontValue, lineHeightValue, themeColor, themeColorContrast, themeColorLine },
} = useResumePreviewContext();
const bandStyle = computed(() => {
  const pageTop = Math.max(0, Number(ui.value?.page?.padding?.vertical ?? defaultPaddingVertical) || 0);
  const horizontal = Math.max(0, Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal) || 0);
  const radius = Math.max(0, Number(ui.value?.page?.radius ?? defaultPageRadius) || 0);
  // 色带外扩、圆角和高度都由标语组件自身维护。
  return {
    width: "auto",
    height: `${Math.max(0, bandHeight - pageTop)}px`, // 色带在页面内容区内的实际占位
    marginLeft: `-${horizontal}px`,
    marginRight: `-${horizontal}px`,
    borderTopLeftRadius: `${radius}px`,
    borderTopRightRadius: `${radius}px`,
    "--slogan-band-height": `${bandHeight}px`, // 背景与底部细线共用的视觉高度
    "--slogan-band-page-top": `${pageTop}px`, // 背景和文字换算纸张顶边
    color: themeColorContrast.value, // 标语文字颜色
  };
});
</script>

<template>
  <div class="relative box-border w-full min-w-0" :style="bandStyle">
    <!-- 背景和文字都属于同一个标语组件，节点自身高度供分页测量。 -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 [border-radius:inherit]"
      :style="{ top: 'calc(-1 * var(--slogan-band-page-top))', height: 'var(--slogan-band-height)', backgroundColor: themeColor }"
    />
    <div class="absolute inset-x-0 flex flex-col items-center gap-3 text-center" :style="{ top: 'calc(24px - var(--slogan-band-page-top))' }">
      <div class="font-bold tracking-wide" :style="[fontValue(2), lineHeightValue()]">
        <ResumeField :model-value="slogan.title" />
      </div>
      <div class="opacity-80" :style="[fontValue(), lineHeightValue()]">
        <ResumeField :model-value="slogan.subtitle" />
      </div>
    </div>
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 h-1"
      :style="{ top: 'calc(var(--slogan-band-height) - var(--slogan-band-page-top) - 4px)', backgroundColor: themeColorLine }"
    />
  </div>
</template>
