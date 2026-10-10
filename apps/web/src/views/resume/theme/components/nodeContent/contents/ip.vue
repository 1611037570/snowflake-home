<script setup lang="ts">
import IpContent from "@/views/resume/editor/preview/resumePages/render/ipContent.vue";
import { useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { item, richTextHtml, showItemHeader } = useNodeContent(props);
</script>

<template>
  <IpContent
    :item="item"
    :block-range="blockRange"
    :decoration="decoration"
    :content-html="richTextHtml"
    :show-item-header="showItemHeader"
    :date-rail="dateRail"
  />
</template>
