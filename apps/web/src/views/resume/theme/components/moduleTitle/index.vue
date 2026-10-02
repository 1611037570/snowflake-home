<script setup>
import { computed, defineAsyncComponent, provide } from "vue";
import {
  CUSTOM_MODULE_ICON,
  DEFAULT_MODULE_NAMES,
} from "@/stores/modules/resume/config/defaultConfig";
import { getPreviewTitle } from "@/views/resume/editor/preview/shared/i18n";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 标题组件按文件名自动加载，具体主题风格由统一主题注册表指定。
const themeComponents = Object.fromEntries(
  Object.entries(import.meta.glob("./themes/*.vue")).map(([path, loader]) => [
    path.slice("./themes/".length, -".vue".length),
    defineAsyncComponent(loader),
  ]),
);
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
  theme: { titleFontStyle, themeTemplate, titleIconMode },
} = useResumePreviewContext();

const displayTitle = computed(() => {
  const moduleData = previewData.value?.[props.moduleKey];
  // 模块标题统一读取 ui.title
  const moduleTitle = moduleData?.ui?.title;
  return props.title || moduleTitle || getPreviewTitle(props.moduleKey, previewLang.value);
});
// 标题组件按解析后的 ID 加载，未匹配时回退默认组件。
const current = computed(() => themeComponents[themeTemplate.value] || themeComponents.default);

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
  <component :is="current" :title="displayTitle" v-if="displayTitle" :style="[titleFontStyle]" />
</template>

<style lang="scss" scoped></style>
