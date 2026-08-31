<script setup>
import { computed, inject } from "vue";
import Business from "./themes/business.vue";
import Default from "./themes/default.vue";
import Minimal from "./themes/minimal.vue";
import Modern from "./themes/modern.vue";

// 标题主题映射：新增主题在此注册并新建对应主题组件，无需改动模板
const themeComponents = {
  default: Default,
  modern: Modern,
  business: Business,
  minimal: Minimal,
};
defineProps({
  title: {
    type: String,
    default: "教育经历",
  },
});
const themeTemplateRef = inject("themeTemplate");
// 风格模板：未提供时按默认样式处理
const themeTemplate = computed(() => themeTemplateRef?.value || "default");
// 当前主题组件：未匹配时回退默认主题
const current = computed(() => themeComponents[themeTemplate.value] || themeComponents.default);
</script>

<template>
  <component :is="current" :title="title" />
</template>

<style lang="scss" scoped></style>
