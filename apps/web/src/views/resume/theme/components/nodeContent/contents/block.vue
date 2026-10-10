<script setup lang="ts">
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { nodePayload } = useNodeContent(props);
</script>

<template>
  <ResumeField :model-value="nodePayload.value" />
</template>
