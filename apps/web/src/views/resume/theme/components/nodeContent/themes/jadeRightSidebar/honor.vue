<script setup lang="ts">
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { item } = useNodeContent(props);
const { theme: { fontValue } } = useResumePreviewContext();
</script>

<template>
  <!-- 荣誉章落在墨玉卡内，改用半透烫金底与反白文字，公共配色在深底上不可读。 -->
  <div
    class="inline-flex rounded-[3px] border px-3 py-2"
    :style="{
      backgroundColor: 'color-mix(in srgb, var(--jade-gold) 16%, transparent)',
      borderColor: 'color-mix(in srgb, var(--jade-gold) 45%, transparent)',
      color: 'var(--jade-contrast)',
      ...fontValue(),
    }"
  >
    <ResumeField :model-value="item.name" />
  </div>
</template>
