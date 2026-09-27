<script setup>
import { computed } from "vue";
import UserHeading from "./components/userHeading.vue";
import { useResumePreviewContext } from "../../shared/previewContext";

const {
  theme: { themeTemplate: themeTemplateRef },
} = useResumePreviewContext();
// 个人信息内容只处理头像、姓名和联系方式的排布。
const showDivider = computed(() => themeTemplateRef.value === "modern");
</script>

<template>
  <UserHeading :show-divider="showDivider" />
</template>
