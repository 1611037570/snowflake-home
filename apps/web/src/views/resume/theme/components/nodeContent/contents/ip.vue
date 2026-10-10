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

import FieldContent from "@/views/resume/editor/preview/components/resumeField/content.vue";
import { useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { item, richTextHtml, richTextBlocks, showItemHeader, isBlockVisible, contentSpacingStyle } = useNodeContent(props);

const {
  theme: { innerSpacingStyle, dateStyle, datePosition },
} = useResumePreviewContext();

// 时间轴主题下日期进入左侧固定栏，普通主题按日期位置决定前后顺序
const isTimeline = computed(() => props.dateRail === true);
// 确权时间：专利为申请到授权，软著为登记日，只填一个时显示单个时间
const grantTime = computed(() => getTime(item.value.applyDate, item.value.grantDate, dateStyle.value));
// 成果名称：软件著作权将版本号并入名称展示
const displayTitle = computed(() => {
  const title = String(item.value.title || "").trim();
  const version = String(item.value.version || "").trim();
  return version ? `${title} ${version}` : title;
});
// 权利人
const holderItems = computed(() => [item.value.holders].filter((value) => Boolean(value)));
// 发明人位次与确权状态：同行展示，供招聘方快速判断成果分量
const signatureItems = computed(() =>
  [item.value.authorOrder, item.value.status].filter((value) => Boolean(value)),
);
// 编号行是否可见：受理机构与确权编号任一有值即渲染
const hasNumberRow = computed(() => Boolean(item.value.authority || item.value.number));
// 成果标签是否可见
const hasTagRow = computed(() => Array.isArray(item.value.tags) && item.value.tags.length > 0);
// 可见块统一登记顺序，缺少可选行时自动重新编号。
const blocks = computed(() => createContentBlocks([
  "title",
  ...(holderItems.value.length ? ["holders"] : []),
  ...(hasNumberRow.value ? ["number"] : []),
  ...(hasTagRow.value ? ["tags"] : []),
  ...(richTextHtml.value ? ["body"] : []),
]));
</script>

<template>
  <!-- 块一：成果类型、成果名称与确权时间 -->
  <div
    v-if="showItemHeader && isBlockVisible(blocks.indexOf('title'))"
    class="flex flex-wrap items-center justify-between gap-3"
  >
    <div class="flex min-w-0 flex-1 flex-wrap items-center gap-3">
      <ItemTags v-if="item.type" :tags="[item.type]" />
      <div class="min-w-0 flex-1">
        <ItemTitle :name="displayTitle" :emphasis="isTimeline || datePosition !== 'left'" />
      </div>
    </div>
    <ItemDate :value="grantTime" :date-rail="isTimeline" />
  </div>

  <!-- 块二：权利人与发明人位次、确权状态 -->
  <div
    v-if="holderItems.length && showItemHeader && isBlockVisible(blocks.indexOf('holders'))"
    class="flex flex-wrap items-center justify-between gap-3"
    :style="innerSpacingStyle"
  >
    <div class="max-w-full min-w-0 flex-1">
      <InlineInfoList :items="holderItems" />
    </div>
    <InlineInfoList :items="signatureItems" />
  </div>

  <!-- 块三：受理登记机构与确权编号 -->
  <div
    v-if="hasNumberRow && showItemHeader && isBlockVisible(blocks.indexOf('number'))"
    class="flex flex-wrap items-center gap-3"
    :style="innerSpacingStyle"
  >
    <InlineInfoList :items="[item.authority, item.number].filter((value) => Boolean(value))" />
  </div>

  <!-- 块四：成果标签 -->
  <div
    v-if="hasTagRow && showItemHeader && isBlockVisible(blocks.indexOf('tags'))"
    class="flex flex-wrap items-center gap-3"
    :style="innerSpacingStyle"
  >
    <ItemTags :tags="item.tags" />
  </div>

  <!-- 块五：成果简介作为单个块，内部段落由字符区间切分，保证块序与测量层一致 -->
  <div v-if="richTextHtml && isBlockVisible(blocks.indexOf('body'))" data-layout-text-block :style="contentSpacingStyle()">
    <FieldContent :blocks="richTextBlocks" html />
  </div>
</template>
