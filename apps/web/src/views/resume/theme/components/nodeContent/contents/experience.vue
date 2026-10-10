<script setup lang="ts">
import { computed } from "vue";
import ItemDate from "@/views/resume/editor/preview/components/itemDate.vue";
import ItemTitle from "@/views/resume/editor/preview/components/itemTitle.vue";
import ItemTags from "@/views/resume/editor/preview/components/itemTags.vue";
import InlineInfoList from "@/views/resume/editor/preview/components/inlineInfoList.vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { getTime } from "@/views/resume/editor/preview/resumePages/render/getTime";
import { isContentEmpty } from "@/views/resume/editor/preview/shared/validData";
import { safeContentUrl } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";
import { useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { nodePayload, item, richTextHtml, hasContentBlock, isBlockVisible, showItemHeader } = useNodeContent(props);
const { theme: { innerSpacingStyle, dateStyle, datePosition, linkUnderline } } = useResumePreviewContext();
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
      value.link?.name ||
      value.link?.url,
  );
});
const hasItemMeta = computed(() => {
  const value = item.value;
  return Boolean(value.tags?.length || value.link?.name || value.link?.url);
});
const bodyBlockIndex = computed(() => (hasItemHeader.value ? 2 : 0) + (hasItemMeta.value ? 1 : 0));
const getItemLink = (value: any) => {
  const link = value?.link;
  if (typeof link === "string") return { name: "", url: link.trim() };
  return {
    name: String(link?.name || "").trim(),
    url: String(link?.url || "").trim(),
  };
};
const itemLink = computed(() => getItemLink(item.value));
const safeItemLinkUrl = computed(() => safeContentUrl(itemLink.value.url));
const itemContentSpacingStyle = computed(() => {
  if (props.decoration === "middle" || props.decoration === "bottom") return { marginTop: "0px" };
  return hasItemHeader.value ? innerSpacingStyle.value : { marginTop: "0px" };
});

</script>

<template>
  <template v-if="hasContentBlock">
    <!-- 块区间按实际存在的头部、标签链接和正文顺序，与测量层 DOM 块序保持一致 -->
    <div
      v-if="hasItemHeader && showItemHeader && isBlockVisible(0)"
      class="flex flex-wrap items-center justify-between gap-3"
    >
      <div class="min-w-0 flex-1">
        <ItemTitle :name="item.name" :emphasis="isTimeline || datePosition !== 'left'" />
      </div>
      <!-- 普通主题按日期位置排序，时间轴主题放进条目左侧固定栏。 -->
      <ItemDate :value="getTime(item.startTime, item.endTime, dateStyle)" :date-rail="isTimeline" />
    </div>
    <div
      v-if="hasItemHeader && showItemHeader && isBlockVisible(1)"
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
      v-if="hasItemHeader && showItemHeader && hasItemMeta && isBlockVisible(2)"
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
      v-if="!isContentEmpty(item.content) && isBlockVisible(bodyBlockIndex)"
      :style="itemContentSpacingStyle"
    >
      <ResumeField :model-value="richTextHtml" html />
    </div>
  </template>
</template>

<style scoped>
:deep(a:hover) { text-decoration: underline; }
</style>
