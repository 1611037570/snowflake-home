<script setup lang="ts">
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { richTextHtml, hasContentBlock } = useNodeContent(props);
const { theme: { textAlign } } = useResumePreviewContext();
</script>

<template>
  <div
    v-if="richTextHtml && hasContentBlock"
    class="layout-rich-text" data-layout-text-block
    :class="`layout-rich-text--${decoration || 'full'}`"
  >
    <div
      class="break-words whitespace-pre-wrap"
      :style="{ textAlign: textAlign === 'justify' ? 'justify' : undefined }"
      v-html="richTextHtml"
    />
  </div>
</template>
