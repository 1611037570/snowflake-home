<script setup lang="ts">
import { computed } from "vue";
import { useResumePreviewContext } from "../../shared/previewContext";
import { resolveNodeContent } from "@/views/resume/theme/components/nodeContent/registry";
import type { NodeContentProps } from "./nodeContentContract";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { theme: { themeTemplate } } = useResumePreviewContext();
// 业务语义由适配器给出，测量与预览共用组件分发，不再逐个判断模块。
const current = computed(() => resolveNodeContent(themeTemplate.value, props.node.contentKind ?? props.node.type));
</script>

<template>
  <component :is="current" v-bind="props" />
</template>
