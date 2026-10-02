<script setup>
import { computed } from "vue";
import UserHeading from "./components/userHeading.vue";
import TwoColumnUser from "./components/twoColumnUser.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { userModuleTemplate: themeTemplateRef },
} = useResumePreviewContext();
// 个人信息内容只处理头像、姓名和联系方式的排布。
const showDivider = computed(() => themeTemplateRef.value === "modern");
// 普通双栏使用独立的个人信息组件，其他布局沿用单栏组件。
const isTwoColumn = computed(() => ui.value?.layout?.type === "twoColumn");
</script>

<template>
  <TwoColumnUser v-if="isTwoColumn" />
  <UserHeading v-else :show-divider="showDivider" />
</template>
