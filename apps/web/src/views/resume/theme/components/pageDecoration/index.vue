<script setup lang="ts">
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { resolvePageDecoration } from "./registry";

const { themeDecisions } = useResumePreviewContext();
const appearance = computed(() => themeDecisions.value.topDecoration
  ? resolvePageDecoration(themeDecisions.value.topDecoration) : null);
</script>

<template>
  <!-- 占位高度由真实组件测量，测量与首页预览使用相同外观。 -->
  <div v-if="appearance" data-layout-decoration class="w-full shrink-0"><component :is="appearance" /></div>
</template>
