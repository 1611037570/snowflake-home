<script setup>
import { computed, inject } from "vue";

defineProps({
  title: {
    type: String,
    default: "教育经历",
  },
});
const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");
const themeColor = inject("themeColor");
// 在 setup 中获取注入的引用（inject 不可在 computed getter 内调用），再取响应式值
const themeTemplateRef = inject("themeTemplate");
// 风格模板：未提供时按默认样式处理
const themeTemplate = computed(() => themeTemplateRef?.value || "default");
</script>

<template>
  <!-- 默认风格：左侧主题色色条 + 下细线 -->
  <div
    v-if="themeTemplate === 'default' && title"
    class="flex items-center border-b border-sf-b pb-2"
  >
    <div class="mr-3 h-4 w-1 rounded-full bg-sf-theme" :style="{ background: themeColor }"></div>
    <h2 class="font-bold tracking-wide" :style="[fontValue(5), lineHeightValue(5)]">{{ title }}</h2>
  </div>
  <!-- 现代风格：下粗色条 -->
  <div
    v-else-if="themeTemplate === 'modern' && title"
    class="border-b-4 pb-2"
    :style="{ borderColor: themeColor }"
  >
    <h2 class="font-bold tracking-wide" :style="[fontValue(5), lineHeightValue(5)]">{{ title }}</h2>
  </div>
  <!-- 简约风格：居中 + 上下细线 -->
  <div v-else-if="title" class="border-y border-sf-b py-1 text-center">
    <h2 class="font-bold tracking-wide" :style="[fontValue(5), lineHeightValue(5)]">{{ title }}</h2>
  </div>
</template>

<style lang="scss" scoped></style>
