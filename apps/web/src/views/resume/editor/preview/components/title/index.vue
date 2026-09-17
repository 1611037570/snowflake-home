<script setup>
import { computed, inject, provide } from "vue";
import { CUSTOM_MODULE_ICON, DEFAULT_MODULE_NAMES } from "@/stores/modules/resume/defaultConfig";
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
const props = defineProps({
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
const previewData = inject(
  "previewData",
  computed(() => ({})),
);
// 模块标题字号：由 ResumePages 注入，独立控制标题大小
const titleFontStyle = inject(
  "titleFontStyle",
  computed(() => ({})),
);

const displayTitle = computed(() => {
  const moduleData = previewData.value?.[props.moduleKey];
  // 模块标题统一读取 ui.title
  const moduleTitle = moduleData?.ui?.title;
  return props.title || moduleTitle || getPreviewTitle(props.moduleKey, previewLang.value);
});
const themeTemplateRef = inject("themeTemplate");
// 风格模板：未提供时按默认样式处理
const themeTemplate = computed(() => themeTemplateRef?.value || "default");
// 当前主题组件：未匹配时回退默认主题
const current = computed(() => themeComponents[themeTemplate.value] || themeComponents.default);

// 标题图标开关：由 ResumePages 注入，关闭时不展示模块图标
const titleIconEnabled = inject(
  "titleIconEnabled",
  computed(() => false),
);
// 模块图标：取模块默认图标表，自定义模块用统一图标，未知模块不展示
const titleIcon = computed(() => {
  if (!titleIconEnabled.value) return "";
  const key = props.moduleKey;
  return (
    DEFAULT_MODULE_NAMES.find((item) => item.key === key)?.icon ||
    (key.startsWith("custom") ? CUSTOM_MODULE_ICON : "")
  );
});
// 图标尺寸与标题字号保持一致（SfIcon 的 size 单位为 px 除以 4）
const titleIconSize = computed(() => {
  const size = parseFloat(titleFontStyle.value?.fontSize);
  return Number.isFinite(size) ? size / 4 : 4;
});
provide("titleIcon", titleIcon);
provide("titleIconSize", titleIconSize);
</script>

<template>
  <component :is="current" :title="displayTitle" :style="[titleFontStyle]" />
</template>

<style lang="scss" scoped></style>
