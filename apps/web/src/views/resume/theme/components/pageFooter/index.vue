<script setup lang="ts">
import { computed } from "vue";
import type { FooterTemplateId } from "@/domain/resume/theme/uiTypes";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { resolvePageFooter } from "./registry";
import { resolveFooterTemplate } from "./templates";

const props = defineProps<{
  text: string; // 公共页面生成的品牌与页码文案。
  templateId: FooterTemplateId; // 页尾模板编号。
}>();
const { theme: { themeTemplate } } = useResumePreviewContext();
const appearance = computed(() => resolvePageFooter(themeTemplate.value));
const selectedTemplate = computed(() => resolveFooterTemplate(props.templateId));
</script>

<template>
  <!-- 主题只替换固定页尾槽位的外观，不能改写分页预留高度。 -->
  <component :is="appearance">
    <component :is="selectedTemplate" :text="text" />
  </component>
</template>
