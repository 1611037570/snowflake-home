<script setup lang="ts">
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { item } = useNodeContent(props);
const { theme: { themeColor, themeColorSoft, fontValue } } = useResumePreviewContext();
</script>

<template>
  <div
    class="inline-flex rounded-xl px-3 py-2"
    :style="{
      backgroundColor: themeColorSoft,
      color: themeColor,
      ...fontValue(),
    }"
  >
    <ResumeField :model-value="item.name" />
  </div>
</template>
