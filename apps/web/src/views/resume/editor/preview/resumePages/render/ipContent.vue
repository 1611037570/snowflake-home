<script setup lang="ts">
import { computed, type PropType } from "vue";
import { createContentBlocks, isContentBlockVisible, type ContentBlockRange } from "@/views/resume/editor/preview/resumePages/engine/contentBlocks";
import ItemTags from "../../components/itemTags.vue";
import ItemDate from "../../components/itemDate.vue";
import ItemTitle from "../../components/itemTitle.vue";
import InlineInfoList from "../../components/inlineInfoList.vue";
import ResumeField from "../../components/resumeField/index.vue";
import { getTime } from "./getTime";
import { useResumePreviewContext } from "../../shared/previewContext";

const props = defineProps({
  // 知识产权条目业务数据
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
  theme: { innerSpacingStyle, dateStyle, datePosition },
} = useResumePreviewContext();

// 块区间判定：块序号与测量层共用同一份结构
const isBlockVisible = (index: number) =>
  isContentBlockVisible(index, props.blockRange);
// 时间轴主题下日期进入左侧固定栏，普通主题按日期位置决定前后顺序
const isTimeline = computed(() => props.dateRail === true);
// 确权时间：专利为申请到授权，软著为登记日，只填一个时显示单个时间
const grantTime = computed(() => getTime(props.item.applyDate, props.item.grantDate, dateStyle.value));
// 成果名称：软件著作权将版本号并入名称展示
const displayTitle = computed(() => {
  const title = String(props.item.title || "").trim();
  const version = String(props.item.version || "").trim();
  return version ? `${title} ${version}` : title;
});
// 权利人
const holderItems = computed(() => [props.item.holders].filter((value) => Boolean(value)));
// 发明人位次与确权状态：同行展示，供招聘方快速判断成果分量
const signatureItems = computed(() =>
  [props.item.authorOrder, props.item.status].filter((value) => Boolean(value)),
);
// 编号行是否可见：受理机构与确权编号任一有值即渲染
const hasNumberRow = computed(() => Boolean(props.item.authority || props.item.number));
// 成果标签是否可见
const hasTagRow = computed(() => Array.isArray(props.item.tags) && props.item.tags.length > 0);
// 可见块统一登记顺序，缺少可选行时自动重新编号。
const blocks = computed(() => createContentBlocks([
  "title",
  ...(holderItems.value.length ? ["holders"] : []),
  ...(hasNumberRow.value ? ["number"] : []),
  ...(hasTagRow.value ? ["tags"] : []),
  ...(props.contentHtml ? ["body"] : []),
]));
// 正文与头部的间距只计在首段，续段紧接上文，与分页高度口径一致
const contentSpacingStyle = computed(() => {
  if (props.decoration === "middle" || props.decoration === "bottom") return { marginTop: "0px" };
  return props.showItemHeader ? innerSpacingStyle.value : { marginTop: "0px" };
});
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
  <div v-if="contentHtml && isBlockVisible(blocks.indexOf('body'))" :style="contentSpacingStyle">
    <ResumeField :model-value="contentHtml" html />
  </div>
</template>
