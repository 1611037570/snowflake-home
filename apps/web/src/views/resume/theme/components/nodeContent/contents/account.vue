<script setup lang="ts">
import ItemTitle from "@/views/resume/editor/preview/components/itemTitle.vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { safeContentUrl as safeUrl } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";
import { useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { item } = useNodeContent(props);
const { theme: { linkUnderline } } = useResumePreviewContext();
</script>

<template>
  <div class="flex max-w-full min-w-0 items-center">
    <!-- 有名称时只展示名称，名称缺失时才回退展示链接地址 -->
    <span v-if="item.name" class="shrink-0 whitespace-nowrap">
      <ItemTitle :name="item.name" class="inline-block" />
    </span>
    <!-- 链接需要 flex-1 + overflow-hidden 的包裹层，窄栏内才能截断溢出 -->
    <div v-else class="flex min-w-0 flex-1 items-center overflow-hidden">
      <a
        :href="safeUrl(item.url)"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-block max-w-full truncate whitespace-nowrap hover:underline"
        :class="{ underline: linkUnderline }"
      >
        <ResumeField
          :model-value="item.url"
          class="flex max-w-full items-center truncate whitespace-nowrap hover:underline"
          boxClass="truncate"
          :class="{ underline: linkUnderline }"
        />
      </a>
    </div>
  </div>
</template>
