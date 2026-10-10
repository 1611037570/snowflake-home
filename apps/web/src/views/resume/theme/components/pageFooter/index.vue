<script setup lang="ts">
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { resolvePageFooter } from "./registry";

defineProps<{ text: string /* 公共页面生成的品牌与页码文案 */ }>();
const { theme: { themeTemplate } } = useResumePreviewContext();
const appearance = computed(() => resolvePageFooter(themeTemplate.value));
</script>

<template>
  <!-- 主题只替换固定页尾槽位的外观，不能改写分页预留高度。 -->
  <component :is="appearance" :text="text" />
</template>
