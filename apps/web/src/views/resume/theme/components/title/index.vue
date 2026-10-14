<script setup>
import { computed, provide } from "vue";
import {
  CUSTOM_MODULE_ICON,
  DEFAULT_MODULE_NAMES,
} from "@/stores/modules/resume/config/defaultConfig";
import { getPreviewTitle } from "@/views/resume/editor/preview/shared/i18n";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { defaultTitleStyleId, titleStyleComponents } from "./styles";
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
// 标题所需数据与主题统一读取预览共享上下文。
const {
  data: previewData,
  lang: previewLang,
  theme: { titleFontStyle, titleTemplate, titleIconMode },
} = useResumePreviewContext();

const displayTitle = computed(() => {
  const moduleData = previewData.value?.[props.moduleKey];
  // 模块标题统一读取 ui.title
  const moduleTitle = moduleData?.ui?.title;
  return props.title || moduleTitle || getPreviewTitle(props.moduleKey, previewLang.value);
});
// 标题组件按归一后的标题样式编号加载，未匹配时回退兜底标题样式。
const current = computed(
  () => titleStyleComponents[titleTemplate.value] || titleStyleComponents[defaultTitleStyleId],
);

// 模块图标：取模块默认图标表，自定义模块用统一图标，未知模块不展示
const moduleIcon = computed(() => {
  if (titleIconMode.value === "none") return "";
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
provide("moduleIcon", moduleIcon);
provide("titleIconSize", titleIconSize);
</script>

<template>
  <!-- 公开模块标题标记，栏内装饰不依赖具体主题的标题类名。 -->
  <component :is="current" :title="displayTitle" :module-key="moduleKey" v-if="displayTitle" data-resume-module-title :style="[titleFontStyle]" />
</template>

<style lang="scss" scoped></style>
