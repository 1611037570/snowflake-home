<script setup lang="ts">
import { computed } from "vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import FieldContent from "@/views/resume/editor/preview/components/resumeField/content.vue";
import NotionTemplate from "@/views/resume/theme/components/skillTemplate/notion.vue";
import { safeContentUrl, useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { item, nodePayload, richTextHtml, richTextBlocks } = useNodeContent(props);
const { theme: { fontValue } } = useResumePreviewContext();
// 墨玉主题的标签布局保留主题配色，同时展示整组荣誉名称。
const tagNames = computed(() => nodePayload.value.items?.map(({ name }) => name).filter((name) => Boolean(name)) ?? []);
// 详情卡片只把有效的荣誉链接渲染为可跳转地址。
const honorLink = computed(() => {
  // 荣誉链接统一读取名称和地址对象。
  const link = item.value.link as { name?: string; url?: string } | undefined;
  const url = link?.url;
  const name = link?.name;
  const safeUrl = safeContentUrl(url, new Set(["http:", "https:"]));
  return safeUrl ? { url: safeUrl, name: String(name || url) } : null;
});
</script>

<template>
  <!-- 荣誉章使用墨玉主题的烫金底与反白文字。 -->
  <div v-if="nodePayload.honorLayout === 'tag'" class="flex w-full flex-wrap gap-3">
    <span
      v-for="name in tagNames"
      :key="name"
      class="inline-flex rounded-[3px] border px-3 py-2"
      :style="{
        backgroundColor: 'color-mix(in srgb, var(--jade-gold) 16%, transparent)',
        borderColor: 'color-mix(in srgb, var(--jade-gold) 45%, transparent)',
        color: 'var(--jade-contrast)',
        ...fontValue(),
      }"
    >
      <ResumeField :model-value="name" />
    </span>
  </div>
  <NotionTemplate
    v-else-if="nodePayload.honorLayout === 'notion'"
    :items="nodePayload.items ?? []"
    :style="fontValue(-6)"
  />
  <div v-else-if="nodePayload.honorLayout === 'list'" class="flex w-full items-start gap-3" :style="{ color: 'var(--jade-contrast)', ...fontValue() }">
    <span aria-hidden="true" class="text-[var(--jade-gold)]">•</span>
    <ResumeField :model-value="item.name" tag="span" />
  </div>
  <!-- 详情卡片使用墨玉主题的半透烫金底，名称、描述和链接留在同一块内。 -->
  <div
    v-else-if="nodePayload.honorLayout === 'card'"
    class="flex w-full flex-col gap-3 rounded-2xl border p-3"
    :style="{
      backgroundColor: 'color-mix(in srgb, var(--jade-gold) 16%, transparent)',
      borderColor: 'color-mix(in srgb, var(--jade-gold) 45%, transparent)',
      color: 'var(--jade-contrast)',
      ...fontValue(),
    }"
  >
    <ResumeField :model-value="item.name" tag="span" />
    <div v-if="richTextHtml" data-layout-text-block>
      <FieldContent :blocks="richTextBlocks" html />
    </div>
    <a v-if="honorLink" :href="honorLink.url" target="_blank" rel="noopener noreferrer" class="break-all text-[var(--jade-gold)] hover:underline">
      <ResumeField :model-value="honorLink.name" tag="span" />
    </a>
  </div>
  <div
    v-else
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
