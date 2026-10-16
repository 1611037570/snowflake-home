<script setup lang="ts">
import { computed } from "vue";
import { createContentBlocks } from "@/views/resume/editor/preview/resumePages/engine/contentBlocks";
import ItemTitle from "@/views/resume/editor/preview/components/itemTitle.vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import FieldContent from "@/views/resume/editor/preview/components/resumeField/content.vue";
import ItemTags from "@/views/resume/editor/preview/components/itemTags.vue";
import NotionTemplate from "@/views/resume/theme/components/skillTemplate/notion.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { safeContentUrl, useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { item, nodePayload, richTextHtml, richTextBlocks, showItemHeader, isBlockVisible, contentSpacingStyle } = useNodeContent(props);
const { theme: { linkUnderline, fontValue } } = useResumePreviewContext();
// 标签布局沿用专业技能的标签组件，忽略链接与描述。
const tagNames = computed(() => nodePayload.value.items?.map(({ name }) => name).filter((name) => Boolean(name)) ?? []);
// 文本描述布局保留原有条目结构，其余布局使用各自的节点外观。
const showDefaultContent = computed(() => !nodePayload.value.honorLayout);

// 可跳转的链接协议白名单
const safeUrlProtocols = new Set(["http:", "https:"]);
// 荣誉链接按名称和地址对象读取，仅在合法协议下渲染。
const honorLink = computed(() => {
  const link = item.value.link as { name?: string; url?: string } | undefined;
  const url = link?.url;
  const name = link?.name;
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
  <div v-if="nodePayload.honorLayout === 'tag'" class="flex w-full flex-wrap gap-3" :style="fontValue()">
    <ItemTags :tags="tagNames" />
  </div>
  <NotionTemplate v-if="nodePayload.honorLayout === 'notion'" :items="nodePayload.items ?? []" :style="fontValue(-6)" />
  <div v-if="nodePayload.honorLayout === 'list'" class="flex w-full items-start gap-3" :style="fontValue()">
    <span aria-hidden="true" class="text-sf-theme">•</span>
    <ResumeField :model-value="item.name" tag="span" />
  </div>
  <!-- 详情卡片把名称、描述和链接放在同一块内，随条目整体分页。 -->
  <div v-if="nodePayload.honorLayout === 'card'" class="flex w-full flex-col gap-3 rounded-2xl border border-sf-b bg-sf-theme-3 p-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <ItemTitle :name="item.name" />
      <a
        v-if="honorLink"
        :href="honorLink.url"
        target="_blank"
        rel="noopener noreferrer"
        class="min-w-0 break-all text-sf-theme hover:underline"
        :class="{ underline: linkUnderline }"
      ><ResumeField :model-value="honorLink.name" tag="span" /></a>
    </div>
    <div v-if="richTextHtml" data-layout-text-block>
      <FieldContent :blocks="richTextBlocks" html />
    </div>
  </div>
  <!-- 块一：荣誉名称与可跳转链接 -->
  <div
    v-if="showDefaultContent && showItemHeader && isBlockVisible(blocks.indexOf('title'))"
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
  <div v-if="showDefaultContent && richTextHtml && isBlockVisible(blocks.indexOf('body'))" data-layout-text-block :style="contentSpacingStyle()">
    <FieldContent :blocks="richTextBlocks" html />
  </div>
</template>
