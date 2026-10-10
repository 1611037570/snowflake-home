<script setup lang="ts">
import { computed } from "vue";
import { useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { nodePayload } = useNodeContent(props);
const spacerHeight = computed(() => Number(nodePayload.value?.height) || 0);
</script>

<template>
  <div
    v-if="!leadingOnPage"
    class="shrink-0"
    :class="{ 'resume-debug-paragraph-gap': showDebug }"
    :style="{ height: `${spacerHeight}px` }"
  />
</template>

<style scoped>
@reference "@/styles/tailwind.css";
/* 公共段间距标记仅在调试模式绘制。 */
.resume-debug-paragraph-gap { @apply bg-sf-theme; }
</style>
