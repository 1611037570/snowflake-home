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
import {
  useNodeContent,
  type NodeContentProps,
} from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

// 工作、教育与项目经历共用排布，按模块选择各行的业务字段。
const props = withDefaults(
  defineProps<
    NodeContentProps & {
      pointBody?: boolean; // 点线主题的正文段首样式
    }
  >(),
  {
    blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
    pointBody: false,
  },
);
const {
  item,
  richTextBlocks,
  contentSpacingStyle,
  hasContentBlock,
  isBlockVisible,
  showItemHeader,
} = useNodeContent(props);
const {
  theme: { innerSpacingStyle, dateStyle, datePosition, themeColor, subtitleCenter, linkUnderline },
} = useResumePreviewContext();
const isTimeline = computed(() => props.dateRail === true);
// 教育经历的首行与次行字段不同，其余两类经历共用岗位和部门。
const isEducation = computed(() => props.node.sourceModuleKey === "education");
const titleInfoItems = computed(() => {
  if (!isEducation.value) return [];
  return [item.value.education, item.value.mode, item.value.college];
});
const secondaryItems = computed(() => {
  if (isEducation.value) return [item.value.post, item.value.score];
  // 志愿服务经历展示服务时长，其余经历展示岗位与部门
  if (props.node.sourceModuleKey === "volunteer") return [item.value.duration];
  return [item.value.post, item.value.department];
});
// 首行显示名称、教育信息与日期。
const hasTitleRow = computed(() =>
  Boolean(
    item.value.name ||
      titleInfoItems.value.some(Boolean) ||
      item.value.startTime ||
      item.value.endTime,
  ),
);
// 次要信息由教育的专业和成绩，或工作、项目的岗位和部门组成。
const hasMajorRow = computed(() => secondaryItems.value.some(Boolean));
const getItemLink = (value: ContentItem) => {
  const link = value?.link;
  if (typeof link === "string") return { name: "", url: link.trim() };
  return {
    name: String(link?.name || "").trim(), // 链接显示名称。
    url: String(link?.url || "").trim(), // 链接跳转地址。
  };
};
const itemLink = computed(() => getItemLink(item.value));
const safeItemLinkUrl = computed(() => safeContentUrl(itemLink.value.url));
const hasTags = computed(() => Boolean(item.value.tags?.length));
const hasLink = computed(() => Boolean(itemLink.value.name || itemLink.value.url));
// 副标题居中时，专业或岗位及其相邻字段并入首行。
const majorInline = computed(() => subtitleCenter.value && hasMajorRow.value);
type DetailRow = {
  key: "info" | "meta"; // 预览测量使用的信息行标识。
  secondary: boolean; // 是否展示专业或岗位及其相邻字段。
  city: boolean; // 是否展示城市。
  tags: boolean; // 是否展示标签。
  link: boolean; // 是否展示链接。
};
// 有标签：普通布局为第二行城市、后续行标签与链接；居中布局为后续行城市、标签与链接。
// 无标签：城市与链接同在第二行；居中布局只把次要信息移入首行。
const detailRows = computed<DetailRow[]>(() => {
  const info: DetailRow = {
    key: "info",
    secondary: !subtitleCenter.value && hasMajorRow.value,
    city: Boolean(item.value.city) && !(hasTags.value && subtitleCenter.value),
    tags: false,
    link: !hasTags.value && hasLink.value,
  };
  const meta: DetailRow = {
    key: "meta",
    secondary: false,
    city: Boolean(item.value.city) && hasTags.value && subtitleCenter.value,
    tags: hasTags.value,
    link: hasTags.value && hasLink.value,
  };
  return [info, meta].filter((row) => row.secondary || row.city || row.tags || row.link);
});
// 任一头部信息存在时，正文保留续段间距。
const hasItemHeader = computed(() => hasTitleRow.value || majorInline.value || detailRows.value.length > 0);
// 次要信息并入首行时，即使名称与时间为空也要显示该行。
const titleRowVisible = computed(() => hasTitleRow.value || majorInline.value);
// 块序与实际渲染的信息行保持一致，正文块恒为最后一块。
const blocks = computed(() => {
  const keys: string[] = [];
  if (titleRowVisible.value) keys.push("title");
  keys.push(...detailRows.value.map((row) => row.key));
  if (!isContentEmpty(item.value.content)) keys.push("body");
  return createContentBlocks(keys);
});
const bodyStyle = computed(() => ({
  ...contentSpacingStyle(hasItemHeader.value),
  "--point-dot-color": themeColor.value, // 点线主题的段首方点颜色。
}));
</script>

<template>
  <template v-if="hasContentBlock">
    <!-- 左侧信息占满剩余宽度，避免长图导出时字段因宽度取整被挤到下一行。 -->
    <div
      v-if="titleRowVisible && showItemHeader && isBlockVisible(blocks.indexOf('title'))"
      class="flex w-full flex-wrap items-center justify-between gap-3"
    >
      <div class="flex min-w-0 flex-wrap items-center gap-3" :class="{ 'flex-1': !majorInline }">
        <ItemTitle
          class="min-w-0"
          :name="item.name"
          :emphasis="isTimeline || datePosition !== 'left'"
        />
        <InlineInfoList v-if="isEducation" :items="titleInfoItems" />
      </div>
      <!-- 中位：副标题居中时专业或岗位及其相邻字段并入首行。 -->
      <InlineInfoList v-if="majorInline" :items="secondaryItems" />
      <ItemDate :value="getTime(item.startTime, item.endTime, dateStyle)" :date-rail="isTimeline" />
    </div>
    <!-- 信息行由 detailRows 决定，链接只渲染一次，避免两套布局改动不一致。 -->
    <template v-for="row in detailRows" :key="row.key">
      <div
        v-if="showItemHeader && isBlockVisible(blocks.indexOf(row.key))"
        class="flex w-full flex-wrap items-center justify-between gap-3"
        :style="innerSpacingStyle"
      >
        <div v-if="row.tags" class="flex flex-1 flex-wrap items-center gap-3">
          <ItemTags :tags="item.tags" />
        </div>
        <!-- 次要信息吸收剩余宽度，城市与链接固定靠右。 -->
        <InlineInfoList v-if="row.secondary" :items="secondaryItems" class="flex-1" />
        <div v-if="row.city || row.link" class="ml-auto flex min-w-0 shrink-0 items-center gap-3">
          <ResumeField v-if="row.city" :model-value="item.city" />
          <a
            v-if="row.link && safeItemLinkUrl"
            :href="safeItemLinkUrl"
            :title="itemLink.name"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex max-w-full min-w-0 items-baseline gap-1 break-all hover:underline"
            :class="{ underline: linkUnderline }"
          >
            <!-- 链接名称前显示图标，悬停仅作用于链接文字。 -->
            <SfIcon v-if="itemLink.name" icon="tabler:external-link" size="3" class="shrink-0" />
            <ResumeField
              :model-value="itemLink.name || itemLink.url"
              tag="span"
              class="max-w-full min-w-0 break-all"
              :class="{ underline: linkUnderline }"
            />
          </a>
          <!-- 地址缺失或协议不可用时只展示链接文案。 -->
          <span v-else-if="row.link" class="max-w-full min-w-0 break-all text-sf-theme">
            <ResumeField
              :model-value="itemLink.name || itemLink.url"
              class="max-w-full min-w-0 break-all"
              :class="{ underline: linkUnderline }"
            />
          </span>
        </div>
      </div>
    </template>
    <div
      v-if="!isContentEmpty(item.content) && isBlockVisible(blocks.indexOf('body'))"
      data-layout-text-block
      :class="{ 'point-body': pointBody }"
      :style="bodyStyle"
    >
      <FieldContent :blocks="richTextBlocks" html />
    </div>
  </template>
</template>

<style scoped>
:deep(a:hover) {
  text-decoration: underline;
}

/* 点线主题沿用经历正文的段首方点样式。 */
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

.point-body {
  padding-left: 15px;
}
</style>
