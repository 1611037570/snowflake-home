<script setup>
// 简历 Store
import { useResumeStore } from "@/stores";
// 简历 UI 预设字号列表
import { fontSizeList } from "@/stores/modules/resume/uiConfig";
// Pinia 状态转响应式引用
import { storeToRefs } from "pinia";
// Vue 计算属性与依赖注入
import { computed, provide } from "vue";
// 简历页面渲染组件
import ResumePage from "./page.vue";
// 缩放容器组件
import ScaleContainer from "./ScaleContainer.vue";

// 简历 Store 实例
const resumeStore = useResumeStore();
// 当前 UI 配置响应式对象
const { currentUI } = storeToRefs(resumeStore);

// 内边距样式工厂函数，offset 为偏移量（px），默认 0
const paddingValue = computed(() => (offset = 0) => ({
  padding: `${currentUI.value.padding + offset}px`,
}));
// 当前字号值
const fontSize = computed(() => {
  return currentUI.value.fontSize;
});
// 当前字号在预设列表中的索引，用于计算行高偏移
const fontSizeIndex = computed(() => {
  return fontSizeList.findIndex((item) => item.value === fontSize.value);
});
// 字号样式工厂函数，offset 为偏移量（px），默认 0
const fontValue = computed(() => (offset = 0) => ({
  fontSize: `${currentUI.value.fontSize + offset}px`,
}));
// 行高样式工厂函数，offset 为偏移量（px），默认 0；根据字号索引追加额外行高偏移
const lineHeightValue = computed(() => (offset = 0) => {
  // 字号索引与基准索引（2）的差值 × 3 作为行高额外偏移
  const indexOffset = (fontSizeIndex.value - 2) * 3;
  return {
    lineHeight: `${currentUI.value.lineHeight + offset + indexOffset}px`,
  };
});
// 当前主题色
const themeColor = computed(() => currentUI.value.themeColor);
// 当前主题风格
const themeStyle = computed(() => currentUI.value.themeStyle);
// 向下游组件注入内边距样式工厂
provide("paddingValue", paddingValue);
// 向下游组件注入字号样式工厂
provide("fontValue", fontValue);
// 向下游组件注入行高样式工厂
provide("lineHeightValue", lineHeightValue);
// 向下游组件注入主题色
provide("themeColor", themeColor);
// 向下游组件注入主题风格
provide("themeStyle", themeStyle);
</script>

<template>
  <div class="scrollbar-hide flex h-full flex-1 flex-col items-center overflow-y-auto pt-3">
    <ScaleContainer>
      <ResumePage />
    </ScaleContainer>
  </div>
</template>

<style scoped></style>
