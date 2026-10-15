<script setup lang="ts">
import { computed } from "vue";
import { createContentBlocks } from "@/views/resume/editor/preview/resumePages/engine/contentBlocks";
import ItemTags from "@/views/resume/editor/preview/components/itemTags.vue";
import ItemDate from "@/views/resume/editor/preview/components/itemDate.vue";
import ItemTitle from "@/views/resume/editor/preview/components/itemTitle.vue";
import InlineInfoList from "@/views/resume/editor/preview/components/inlineInfoList.vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { getTime } from "@/views/resume/editor/preview/resumePages/render/getTime";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { isPublicationSelfAuthor, splitPublicationAuthors } from "@/domain/resume/publicationAuthors";

import FieldContent from "@/views/resume/editor/preview/components/resumeField/content.vue";
import { useNodeContent, safeContentUrl, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { item, richTextHtml, richTextBlocks, showItemHeader, isBlockVisible, contentSpacingStyle } = useNodeContent(props);

const {
  data: previewData,
  theme: { innerSpacingStyle, dateStyle, datePosition, linkUnderline },
} = useResumePreviewContext();

// 可跳转的链接协议白名单
const safeUrlProtocols = new Set(["http:", "https:"]);
// 时间轴主题下日期进入左侧固定栏，普通主题按日期位置决定前后顺序
const isTimeline = computed(() => props.dateRail === true);
// 发表时间：论文为单时间点，取发表日期
const publishTime = computed(() => getTime(item.value.date, "", dateStyle.value));
// 作者列表：手动选择优先，自动模式按个人信息中的姓名识别。
const authorItems = computed(() => {
  const text = String(item.value.authors || "").trim();
  if (!text) return [];
  const selfName = String(previewData.value?.user?.data?.name || "").trim();
  return splitPublicationAuthors(text)
    .map((name) => ({
      value: name, // 作者署名及作者身份标记。
      emphasis: isPublicationSelfAuthor(name, item.value.selfAuthor, selfName), // 本人姓名是否加粗。
    }));
});
// 载体行是否可见：期刊会议或论文链接有值时渲染。
const hasVenueRow = computed(() =>
  Boolean(item.value.venue || item.value.doi),
);
// 可见块统一登记顺序，缺少可选行时自动重新编号。
const blocks = computed(() => createContentBlocks([
  "title",
  ...(authorItems.value.length ? ["authors"] : []),
  ...(hasVenueRow.value ? ["venue"] : []),
  ...(richTextHtml.value ? ["body"] : []),
]));
// 论文链接仅在合法协议下渲染为可跳转链接
const safeDoiUrl = computed(() => {
  const text = String(item.value.doi || "").trim();
  if (!/^https?:\/\//i.test(text)) return "";
  return safeContentUrl(text, safeUrlProtocols);
});
</script>

<template>
  <!-- 块一：论文标题后同行显示标签，发表时间保持在右侧。 -->
  <div
    v-if="showItemHeader && isBlockVisible(blocks.indexOf('title'))"
    class="flex flex-wrap items-center justify-between gap-3"
  >
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <ItemTitle class="min-w-0" :name="item.title" :emphasis="isTimeline || datePosition !== 'left'" />
      <ItemTags v-if="item.indexTags?.length" :tags="item.indexTags" />
    </div>
    <ItemDate :value="publishTime" :date-rail="isTimeline" />
  </div>

  <!-- 块二：作者署名与发表状态 -->
  <div
    v-if="authorItems.length && showItemHeader && isBlockVisible(blocks.indexOf('authors'))"
    class="flex flex-wrap items-center justify-between gap-3"
    :style="innerSpacingStyle"
  >
    <div class="max-w-full min-w-0 flex-1">
      <InlineInfoList :items="authorItems" />
    </div>
    <InlineInfoList :items="[item.status]" />
  </div>

  <!-- 块三：发表载体与论文链接，载体名按学术惯例斜体 -->
  <div
    v-if="hasVenueRow && showItemHeader && isBlockVisible(blocks.indexOf('venue'))"
    class="flex flex-wrap items-center justify-between gap-3"
    :style="innerSpacingStyle"
  >
    <div class="max-w-full min-w-0 flex-1">
      <span v-if="item.venue" class="italic">
        <ResumeField tag="span" :model-value="item.venue" />
      </span>
    </div>
    <a
      v-if="safeDoiUrl"
      :href="safeDoiUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="inline max-w-full min-w-0 break-all hover:underline"
      :class="{ underline: linkUnderline }"
    >
      <ResumeField :model-value="item.doi" />
    </a>
    <ResumeField v-else-if="item.doi" :model-value="item.doi" />
  </div>

  <!-- 块四：研究内容作为单个块，内部段落由字符区间切分，保证块序与测量层一致 -->
  <div v-if="richTextHtml && isBlockVisible(blocks.indexOf('body'))" data-layout-text-block :style="contentSpacingStyle()">
    <FieldContent :blocks="richTextBlocks" html />
  </div>
</template>
