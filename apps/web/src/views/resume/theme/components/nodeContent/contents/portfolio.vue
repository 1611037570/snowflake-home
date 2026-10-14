<script setup lang="ts">
import PortfolioWork from "@/views/resume/editor/preview/resumePages/render/portfolioWork.vue";
import { safeContentUrl as safeUrl } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";
import { useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { nodePayload } = useNodeContent(props);
</script>

<template>
  <PortfolioWork :item="nodePayload.item" :url="safeUrl(nodePayload.item?.url)" />
</template>
