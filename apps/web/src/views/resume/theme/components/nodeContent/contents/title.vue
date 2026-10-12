<script setup lang="ts">
import ModuleTitle from "@/views/resume/theme/components/title/index.vue";
import { type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});

</script>

<template>
  <ModuleTitle :module-key="(node.payload as { moduleKey: string }).moduleKey" />
</template>
