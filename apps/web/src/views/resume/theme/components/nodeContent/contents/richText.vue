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

<style scoped>
.layout-rich-text :deep(p),
.layout-rich-text :deep(ul),
.layout-rich-text :deep(ol) {
  margin: 0;
}

/* 恢复全局样式重置掉的列表标记与缩进，保持编辑区和预览区的富文本语义一致 */
.layout-rich-text :deep(ul),
.layout-rich-text :deep(ol) {
  padding-left: 1.5em;
}

.layout-rich-text :deep(ul) {
  list-style: disc;
}

.layout-rich-text :deep(ol) {
  list-style: decimal;
}

.layout-rich-text :deep(p + p),
.layout-rich-text :deep(ul + p),
.layout-rich-text :deep(p + ul),
.layout-rich-text :deep(ol + p),
.layout-rich-text :deep(p + ol) {
  margin-top: 0.75em;
}

/* 空段落保留一行；不额外叠加空行前后的段落间距，给正文尽量多留可用行高 */
.layout-rich-text :deep(p:has(> br:only-child)),
.layout-rich-text :deep(p:has(> br:only-child) + p) {
  margin-top: 0;
}
</style>
