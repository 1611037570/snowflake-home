<script setup>
import { computed, defineAsyncComponent, inject } from "vue";

// 主题组件映射：按需异步加载，同一份简历只使用一种风格，避免全部主题常驻内存
// 新增主题在此注册并新建对应主题组件，无需改动模板
const themeComponents = {
  default: defineAsyncComponent(() => import("./themes/default.vue")),
  modern: defineAsyncComponent(() => import("./themes/modern.vue")),
  business: defineAsyncComponent(() => import("./themes/business.vue")),
  minimal: defineAsyncComponent(() => import("./themes/minimal.vue")),
  classic: defineAsyncComponent(() => import("./themes/classic.vue")),
  academic: defineAsyncComponent(() => import("./themes/academic.vue")),
  fresh: defineAsyncComponent(() => import("./themes/fresh.vue")),
  vivid: defineAsyncComponent(() => import("./themes/vivid.vue")),
  creative: defineAsyncComponent(() => import("./themes/creative.vue")),
  steady: defineAsyncComponent(() => import("./themes/steady.vue")),
};
const themeTemplateRef = inject("themeTemplate");
// 风格模板：未提供时按默认样式处理
const themeTemplate = computed(() => themeTemplateRef?.value || "default");
// 当前主题组件：未匹配时回退默认主题
const current = computed(() => themeComponents[themeTemplate.value] || themeComponents.default);
const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");
</script>

<template>
  <!-- 主题组件根元素统一挂载行容器样式与模块标识 -->
  <component
    :is="current"
    class="resume-row"
    data-module="user"
    :style="[lineHeightValue(), fontValue()]"
  />
</template>

<style lang="scss" scoped></style>
