<script setup>
import { computed, inject } from "vue";
import { getPreviewTitle } from "../../i18n";
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

// 标题主题映射：新增主题在此注册并新建对应主题组件，无需改动模板
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
defineProps({
  title: {
    type: String,
    default: "",
  },
  // 模块 key：存在时按简历展示语言从语言包取标题
  moduleKey: {
    type: String,
    default: "",
  },
});
// 简历展示语言：由 ResumePages 注入，缺省中文
const previewLang = inject(
  "previewLang",
  computed(() => "zh"),
);
const displayTitle = computed(
  () => props.title || getPreviewTitle(props.moduleKey, previewLang.value),
);
const themeTemplateRef = inject("themeTemplate");
// 风格模板：未提供时按默认样式处理
const themeTemplate = computed(() => themeTemplateRef?.value || "default");
// 当前主题组件：未匹配时回退默认主题
const current = computed(() => themeComponents[themeTemplate.value] || themeComponents.default);
</script>

<template>
  <component :is="current" :title="displayTitle" />
</template>

<style lang="scss" scoped></style>
