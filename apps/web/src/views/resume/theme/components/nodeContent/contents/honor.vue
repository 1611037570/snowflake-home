<script setup lang="ts">
import { computed } from "vue";
import { createContentBlocks } from "@/views/resume/editor/preview/resumePages/engine/contentBlocks";
import ItemTitle from "@/views/resume/editor/preview/components/itemTitle.vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import FieldContent from "@/views/resume/editor/preview/components/resumeField/content.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { safeContentUrl, useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { item, richTextHtml, richTextBlocks, showItemHeader, isBlockVisible, contentSpacingStyle } = useNodeContent(props);
const { theme: { linkUnderline } } = useResumePreviewContext();

// 可跳转的链接协议白名单
const safeUrlProtocols = new Set(["http:", "https:"]);
// 荣誉链接仅在合法协议下渲染为可跳转链接，展示名缺省时退回地址本身
const honorLink = computed(() => {
  const link = item.value.link;
  const url = typeof link === "string" ? link : link?.url;
  const name = typeof link === "string" ? link : link?.name;
  const safeUrl = safeContentUrl(String(url || ""), safeUrlProtocols);
  if (!safeUrl) return null;
  return { url: safeUrl, name: String(name || url) };
});
// 可见块统一登记顺序：名称行在前，描述正文在后，缺描述时自动重编号
const blocks = computed(() => createContentBlocks([
  "title",
  ...(richTextHtml.value ? ["body"] : []),
]));
</script>

<template>
  <!-- 块一：荣誉名称与可跳转链接 -->
  <div
    v-if="showItemHeader && isBlockVisible(blocks.indexOf('title'))"
    class="flex flex-wrap items-center justify-between gap-3"
  >
    <div class="min-w-0 flex-1">
      <ItemTitle :name="item.name" :emphasis="props.dateRail === true" />
    </div>
    <a
      v-if="honorLink"
      :href="honorLink.url"
      target="_blank"
      rel="noopener noreferrer"
      class="inline max-w-full min-w-0 break-all hover:underline"
      :class="{ underline: linkUnderline }"
    >
      <ResumeField :model-value="honorLink.name" />
    </a>
  </div>

  <!-- 块二：荣誉描述作为单个块，内部段落由字符区间切分，保证块序与测量层一致 -->
  <div v-if="richTextHtml && isBlockVisible(blocks.indexOf('body'))" data-layout-text-block :style="contentSpacingStyle()">
    <FieldContent :blocks="richTextBlocks" html />
  </div>
</template>
