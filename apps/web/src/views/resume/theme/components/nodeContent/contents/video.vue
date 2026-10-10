<script setup lang="ts">
import ItemTitle from "@/views/resume/editor/preview/components/itemTitle.vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { safeContentUrl as safeUrl } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";
import { useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { nodePayload, slicedItemDesc, isBlockVisible } = useNodeContent(props);
const { theme: { fontValue, linkUnderline, innerSpacingStyle } } = useResumePreviewContext();
</script>

<template>
  <!-- 视频作品保留原始网址文本，避免显示为作品名称。 -->
  <div
    v-if="isBlockVisible(0)"
    class="flex h-auto max-w-full min-w-0 flex-wrap items-center justify-between gap-3"
  >
    <div class="min-w-0 flex-1" :style="fontValue()">
      <ItemTitle v-if="nodePayload.item?.name" :name="nodePayload.item.name" />
    </div>
    <div v-if="safeUrl(nodePayload.item?.url)" class="max-w-[45%] min-w-0 shrink-0 text-right">
      <a
        :href="safeUrl(nodePayload.item.url)"
        target="_blank"
        rel="noopener noreferrer"
        class="inline max-w-full min-w-0 break-all hover:underline"
        :class="{ underline: linkUnderline }"
      >
        <ResumeField
          :model-value="nodePayload.item.url"
          class="inline max-w-full min-w-0 break-all"
        />
      </a>
    </div>
  </div>
  <div
    v-if="nodePayload.item?.desc && isBlockVisible(1)"
    data-layout-split-lines
    :style="decoration === 'middle' || decoration === 'bottom' ? undefined : innerSpacingStyle"
  >
    <ResumeField :model-value="slicedItemDesc" />
  </div>
</template>
