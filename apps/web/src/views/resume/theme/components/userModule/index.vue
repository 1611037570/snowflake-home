<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { resolveUserContent } from "./registry";

// 个人信息内容按注册表解析：主题维度优先、版式维度兜底，组件内不再维护映射表。
const {
  ui,
  theme: { themeTemplate },
} = useResumePreviewContext();
const current = computed(() => resolveUserContent(themeTemplate.value, ui.value?.layout?.type));
</script>

<template>
  <component :is="current" />
</template>
