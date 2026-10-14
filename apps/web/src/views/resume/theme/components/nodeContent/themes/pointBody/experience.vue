<script setup lang="ts">
import { computed } from "vue";
import type { ContentItem } from "@/views/resume/editor/preview/resumePages/render/contentPayload";
import { createContentBlocks } from "@/views/resume/editor/preview/resumePages/engine/contentBlocks";
import ItemDate from "@/views/resume/editor/preview/components/itemDate.vue";
import ItemTitle from "@/views/resume/editor/preview/components/itemTitle.vue";
import ItemTags from "@/views/resume/editor/preview/components/itemTags.vue";
import InlineInfoList from "@/views/resume/editor/preview/components/inlineInfoList.vue";
import FieldContent from "@/views/resume/editor/preview/components/resumeField/content.vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { getTime } from "@/views/resume/editor/preview/resumePages/render/getTime";
import { isContentEmpty } from "@/views/resume/editor/preview/shared/validData";
import { safeContentUrl } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";
import { useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

// 点线正文：经历类正文（教育 / 工作 / 实习 / 项目共用）的段落改由主题语义层排布，
// 段首画主题色方点并拉开段距；块顺序与默认组件完全一致，测量层读到的仍是同一份块序。
const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { nodePayload, item, richTextBlocks, contentSpacingStyle, hasContentBlock, isBlockVisible, showItemHeader } = useNodeContent(props);
const { theme: { innerSpacingStyle, dateStyle, datePosition, linkUnderline, themeColor } } = useResumePreviewContext();
// 日期栏位置由公共条目外框下发，内容组件只消费结果。
const isTimeline = computed(() => props.dateRail === true);
const hasItemHeader = computed(() => {
  const value = item.value;
  return Boolean(
    value.name ||
      value.department ||
      value.post ||
      value.startTime ||
      value.endTime ||
      value.city ||
      value.tags?.length ||
      (typeof value.link === "string" ? value.link : value.link?.name || value.link?.url),
  );
});
const hasItemMeta = computed(() => {
  const value = item.value;
  return Boolean(value.tags?.length || (typeof value.link === "string" ? value.link : value.link?.name || value.link?.url));
});
// 可见块统一登记顺序，测量与裁剪不再分别维护行号。
const blocks = computed(() => createContentBlocks([
  ...(hasItemHeader.value ? ["title", "info"] : []),
  ...(hasItemMeta.value ? ["meta"] : []),
  ...(!isContentEmpty(item.value.content) ? ["body"] : []),
]));
// 正文样式在公共间距之上追加段首方点颜色，伪元素不额外占位，方块尺寸不进测量
const bodyStyle = computed(() => ({
  ...contentSpacingStyle(hasItemHeader.value),
  "--point-dot-color": themeColor.value,
}));
const getItemLink = (value: ContentItem) => {
  const link = value?.link;
  if (typeof link === "string") return { name: "", url: link.trim() };
  return {
    name: String(link?.name || "").trim(),
    url: String(link?.url || "").trim(),
  };
};
const itemLink = computed(() => getItemLink(item.value));
const safeItemLinkUrl = computed(() => safeContentUrl(itemLink.value.url));


</script>

<template>
  <template v-if="hasContentBlock">
    <!-- 块区间按实际存在的头部、标签链接和正文顺序，与测量层 DOM 块序保持一致 -->
    <div
      v-if="hasItemHeader && showItemHeader && isBlockVisible(blocks.indexOf('title'))"
      class="flex flex-wrap items-center justify-between gap-3"
    >
      <div class="min-w-0 flex-1">
        <ItemTitle :name="item.name" :emphasis="isTimeline || datePosition !== 'left'" />
      </div>
      <!-- 普通主题按日期位置排序，时间轴主题放进条目左侧固定栏。 -->
      <ItemDate :value="getTime(item.startTime, item.endTime, dateStyle)" :date-rail="isTimeline" />
    </div>
    <div
      v-if="hasItemHeader && showItemHeader && isBlockVisible(blocks.indexOf('info'))"
      class="flex flex-wrap items-center justify-between gap-3"
      :style="innerSpacingStyle"
    >
      <div class="max-w-full min-w-0 flex-1">
        <InlineInfoList
          :items="nodePayload.inlineInfo"
        />
      </div>
      <ResumeField :model-value="item.city" />
    </div>
    <div
      v-if="hasItemHeader && showItemHeader && hasItemMeta && isBlockVisible(blocks.indexOf('meta'))"
      class="flex flex-wrap items-center justify-between gap-3"
      :style="innerSpacingStyle"
    >
      <div class="flex flex-1 flex-wrap items-center gap-3">
        <ItemTags :tags="item.tags" />
      </div>
      <a
        v-if="safeItemLinkUrl"
        :href="safeItemLinkUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline max-w-full min-w-0 break-all hover:underline"
        :class="{ underline: linkUnderline }"
      >
        <ResumeField :model-value="itemLink.name || itemLink.url" />
      </a>
    </div>
    <!-- 正文作为一个块：内部段落由字符区间切分，保证块序与测量层一致 -->
    <div
      v-if="!isContentEmpty(item.content) && isBlockVisible(blocks.indexOf('body'))"
      data-layout-text-block
      class="point-body"
      :style="bodyStyle"
    >
      <FieldContent :blocks="richTextBlocks" html />
    </div>
  </template>
</template>

<style scoped>
:deep(a:hover) { text-decoration: underline; }

/* 段首方点：伪元素定位在文本左侧，段距拉开让长段落更像文稿 */
.point-body :deep(p) {
  position: relative;
  margin-bottom: 6px;
}

.point-body :deep(p:last-child) {
  margin-bottom: 0;
}

.point-body :deep(p)::before {
  content: "";
  position: absolute;
  left: -15px;
  top: 0.62em;
  width: 4px;
  height: 4px;
  background: var(--point-dot-color);
}

/* 正文块整体右移，给左侧方点留出位置 */
.point-body {
  padding-left: 15px;
}
</style>
