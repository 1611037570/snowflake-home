<script setup lang="ts">
import { computed, type PropType } from "vue";
import { createContentBlocks, isContentBlockVisible, type ContentBlockRange } from "@/views/resume/editor/preview/resumePages/engine/contentBlocks";
import ItemTags from "../../components/itemTags.vue";
import ItemDate from "../../components/itemDate.vue";
import ItemTitle from "../../components/itemTitle.vue";
import InlineInfoList from "../../components/inlineInfoList.vue";
import ResumeField from "../../components/resumeField/index.vue";
import { getInfoSeparatorMark } from "@/stores/modules/resume/config/uiConfig";
import { getTime } from "./getTime";
import { useResumePreviewContext } from "../../shared/previewContext";

const props = defineProps({
  // 论文条目业务数据
  item: { type: Object, default: () => ({}) },
  // 分片覆盖的块区间：只渲染落在区间内的块
  blockRange: { type: Object as PropType<ContentBlockRange>, default: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }) },
  // 分片装饰类型：续段不重复正文上间距
  decoration: { type: String, default: "full" },
  // 已按分片区间切好的正文富文本
  contentHtml: { type: String, default: "" },
  // 是否渲染条目头部：正文续段不再重复头部
  showItemHeader: { type: Boolean, default: true },
  // 条目外观声明的时间轴模式：日期移入左侧固定栏
  dateRail: { type: Boolean, default: false },
});

const {
  data: previewData,
  theme: { innerSpacingStyle, dateStyle, datePosition, linkUnderline, infoSeparator },
} = useResumePreviewContext();

// 可跳转的链接协议白名单
const safeUrlProtocols = new Set(["http:", "https:"]);
const separatorMark = computed(() => getInfoSeparatorMark(infoSeparator.value));
// 块区间判定：块序号与测量层共用同一份结构
const isBlockVisible = (index: number) =>
  isContentBlockVisible(index, props.blockRange);
// 时间轴主题下日期进入左侧固定栏，普通主题按日期位置决定前后顺序
const isTimeline = computed(() => props.dateRail === true);
// 发表时间：论文为单时间点，取发表日期
const publishTime = computed(() => getTime(props.item.date, "", dateStyle.value));
// 作者列表：按分隔符拆分署名，命中本人姓名的部分加粗
const authorItems = computed(() => {
  const text = String(props.item.authors || "").trim();
  if (!text) return [];
  const selfName = String(previewData.value?.user?.data?.name || "").trim();
  const matchesSelf = (name: string) =>
    Boolean(selfName) && (name === selfName || name.includes(selfName) || selfName.includes(name));
  return text
    .split(/[,，;；]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((name) => ({ value: name, emphasis: matchesSelf(name) }));
});
// 本人位次与发表状态：同行展示，供招聘方快速判断成果分量
const signatureItems = computed(() =>
  [props.item.authorOrder, props.item.status].filter((value) => Boolean(value)),
);
// 载体行是否可见：期刊会议、卷期页码与论文链接任一有值即渲染
const hasVenueRow = computed(() =>
  Boolean(props.item.venue || props.item.volumeInfo || props.item.doi),
);
// 索引标签是否可见
const hasTagRow = computed(() => Array.isArray(props.item.indexTags) && props.item.indexTags.length > 0);
// 可见块统一登记顺序，缺少可选行时自动重新编号。
const blocks = computed(() => createContentBlocks([
  "title",
  ...(authorItems.value.length ? ["authors"] : []),
  ...(hasVenueRow.value ? ["venue"] : []),
  ...(hasTagRow.value ? ["tags"] : []),
  ...(props.contentHtml ? ["body"] : []),
]));
// 论文链接仅在合法协议下渲染为可跳转链接
const safeDoiUrl = computed(() => {
  const text = String(props.item.doi || "").trim();
  if (!/^https?:\/\//i.test(text)) return "";
  try {
    const url = new URL(text);
    return safeUrlProtocols.has(url.protocol.toLowerCase()) ? url.href : "";
  } catch {
    return "";
  }
});
// 正文与头部的间距只计在首段，续段紧接上文，与分页高度口径一致
const contentSpacingStyle = computed(() => {
  if (props.decoration === "middle" || props.decoration === "bottom") return { marginTop: "0px" };
  return props.showItemHeader ? innerSpacingStyle.value : { marginTop: "0px" };
});
</script>

<template>
  <!-- 块一：论文标题与发表时间 -->
  <div
    v-if="showItemHeader && isBlockVisible(blocks.indexOf('title'))"
    class="flex flex-wrap items-center justify-between gap-3"
  >
    <div class="min-w-0 flex-1">
      <ItemTitle :name="item.title" :emphasis="isTimeline || datePosition !== 'left'" />
    </div>
    <ItemDate :value="publishTime" :date-rail="isTimeline" />
  </div>

  <!-- 块二：作者署名与本人位次、发表状态 -->
  <div
    v-if="authorItems.length && showItemHeader && isBlockVisible(blocks.indexOf('authors'))"
    class="flex flex-wrap items-center justify-between gap-3"
    :style="innerSpacingStyle"
  >
    <div class="max-w-full min-w-0 flex-1">
      <InlineInfoList :items="authorItems" />
    </div>
    <InlineInfoList :items="signatureItems" />
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
      <span
        v-if="item.venue && item.volumeInfo"
        :class="separatorMark ? 'mx-3' : 'inline-block w-3'"
        aria-hidden="true"
      >
        {{ separatorMark }}
      </span>
      <ResumeField v-if="item.volumeInfo" tag="span" :model-value="item.volumeInfo" />
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

  <!-- 块四：索引与分区标签 -->
  <div
    v-if="hasTagRow && showItemHeader && isBlockVisible(blocks.indexOf('tags'))"
    class="flex flex-wrap items-center gap-3"
    :style="innerSpacingStyle"
  >
    <ItemTags :tags="item.indexTags" />
  </div>

  <!-- 块五：研究内容作为单个块，内部段落由字符区间切分，保证块序与测量层一致 -->
  <div v-if="contentHtml && isBlockVisible(blocks.indexOf('body'))" :style="contentSpacingStyle">
    <ResumeField :model-value="contentHtml" html />
  </div>
</template>
