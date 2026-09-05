<script setup>
import { computed, inject } from "vue";
import Business from "./themes/business.vue";
import Academic from "./themes/academic.vue";
import Classic from "./themes/classic.vue";
import Creative from "./themes/creative.vue";
import Default from "./themes/default.vue";
import Fresh from "./themes/fresh.vue";
import Minimal from "./themes/minimal.vue";
import Modern from "./themes/modern.vue";
import Steady from "./themes/steady.vue";
import Vivid from "./themes/vivid.vue";

// 主题组件映射：新增主题在此注册并新建对应主题组件，无需改动模板
const themeComponents = {
  default: Default,
  modern: Modern,
  business: Business,
  minimal: Minimal,
  classic: Classic,
  academic: Academic,
  fresh: Fresh,
  vivid: Vivid,
  creative: Creative,
  steady: Steady,
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
