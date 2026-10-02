<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { resolveSloganComponent } from "./registry";

// 入口只按主题编号选择组件，内容与尺寸由主题组件维护。
const { ui } = useResumePreviewContext();
const current = computed(() => resolveSloganComponent(ui.value?.theme?.template));
</script>

<template>
  <component :is="current" />
</template>
