<script setup>
import { computed } from "vue";
import UserHeading from "./components/userHeading.vue";
import ModernUser from "./components/modernUser.vue";
import TwoColumnUser from "./components/twoColumnUser.vue";
import TealRailUser from "./components/tealRailUser.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { themeTemplate: themeTemplateRef },
} = useResumePreviewContext();
const layoutComponents = {
  twoColumn: TwoColumnUser, // 左右双栏的个人信息内容组件
};
const themeComponents = {
  modern: ModernUser, // 现代主题的个人信息内容组件
};
const themedLayoutComponents = {
  tealRail: TealRailUser, // 青线双栏的分组个人信息组件
};
// 主题专属布局优先，其余主题仍沿用双栏或默认个人信息组件。
const current = computed(() =>
  themedLayoutComponents[themeTemplateRef.value] || layoutComponents[ui.value?.layout?.type] || themeComponents[themeTemplateRef.value] || UserHeading,
);
</script>

<template>
  <component :is="current" />
</template>
