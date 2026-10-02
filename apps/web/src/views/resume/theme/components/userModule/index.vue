<script setup>
import { computed } from "vue";
import UserHeading from "./components/userHeading.vue";
import ModernUser from "./components/modernUser.vue";
import TwoColumnUser from "./components/twoColumnUser.vue";
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
// 先按布局选择专用组件，再按主题编号选择外观组件。
const current = computed(() =>
  layoutComponents[ui.value?.layout?.type] || themeComponents[themeTemplateRef.value] || UserHeading,
);
</script>

<template>
  <component :is="current" />
</template>
