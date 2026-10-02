<script setup>
import { computed } from "vue";
import UserHeading from "./components/userHeading.vue";
import ModernUser from "./components/modernUser.vue";
import TwoColumnUser from "./components/twoColumnUser.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { userModuleTemplate: themeTemplateRef },
} = useResumePreviewContext();
// 普通双栏使用独立的个人信息组件，其他布局沿用单栏组件。
const isTwoColumn = computed(() => ui.value?.layout?.type === "twoColumn");
// 现代主题的个人信息装饰由自己的组件维护。
const isModern = computed(() => themeTemplateRef.value === "modern");
</script>

<template>
  <TwoColumnUser v-if="isTwoColumn" />
  <ModernUser v-else-if="isModern" />
  <UserHeading v-else />
</template>
