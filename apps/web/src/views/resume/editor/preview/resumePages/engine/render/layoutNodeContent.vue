<script setup lang="ts">
import { computed } from "vue";
import ItemTags from "../../../components/itemTags.vue";
import ItemTitle from "../../../components/itemTitle.vue";
import InlineInfoList from "../../../components/inlineInfoList.vue";
import ModuleContentContainer from "../../../components/moduleContentContainer.vue";
import ResumeField from "../../../components/resumeField/index.vue";
import User from "../../../modules/user/index.vue";
import { getTime } from "../../../../utils";
import { isContentEmpty } from "../../../modules/validData";
import { useResumePreviewContext } from "../../../previewContext";
import { sliceRichTextHtml } from "../adapter/richTextParser";
import type { LayoutNode } from "../types";
import LayoutBlockRange from "./layoutBlockRange.vue";

interface Props {
  node: LayoutNode;
  payload?: unknown;
  contentRange?: { start: number; end: number };
  /** 块区间：只渲染该区间内的块，区间由测量层从真实 DOM 读到的块边界给出 */
  blockRange?: { start: number; end: number };
  decoration?: "full" | "top" | "middle" | "bottom";
}

const props = withDefaults(defineProps<Props>(), {
  blockRange: () => ({ start: 0, end: Number.MAX_SAFE_INTEGER }),
});

const {
  theme: {
    paragraphSpacingStyle,
    innerSpacingStyle,
    dateStyle,
    datePosition,
    linkUnderline,
    fontValue,
    moduleContentStyle,
    textAlign,
    themeColor,
    themeColorSoft,
  },
} = useResumePreviewContext();

const nodePayload = computed(() => (props.payload ?? props.node.payload) as any);
const item = computed(() => nodePayload.value?.item || {});
// 图片作品按条目尺寸占比渲染，和模块原实现的宽度口径保持一致
const mediaWidthStyle = computed(() => {
  const payload = nodePayload.value;
  if (payload?.mediaType !== "image") return undefined;
  return { width: `${payload.item?.size ?? 50}%` };
});
const richTextHtml = computed(() => {
  // 富文本节点的载荷即解析结果，经历条目则读取条目正文的解析结果
  const parsed = nodePayload.value?.content ?? nodePayload.value;
  if (!parsed?.html) return "";
  return sliceRichTextHtml(parsed.html, props.contentRange?.start || 0, props.contentRange?.end);
});
const isExperience = computed(
  () =>
    ["work", "project", "education"].includes(props.node.sourceModuleKey) ||
    props.node.sourceModuleKey.startsWith("custom_"),
);
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
const getItemLink = (value: any) => {
  const link = value?.link;
  if (typeof link === "string") return { name: "", url: link.trim() };
  return {
    name: String(link?.name || "").trim(),
    url: String(link?.url || "").trim(),
  };
};
const safeUrl = (value: unknown) => {
  try {
    const url = new URL(String(value || "").trim());
    return ["http:", "https:", "mailto:"].includes(url.protocol.toLowerCase()) ? url.href : "";
  } catch {
    return "";
  }
};
const fragmentContentStyle = computed(() => {
  const base = { ...moduleContentStyle.value };
  if (props.decoration === "top") base.paddingBottom = "0px";
  if (props.decoration === "middle") {
    base.paddingTop = "0px";
    base.paddingBottom = "0px";
  }
  if (props.decoration === "bottom") base.paddingTop = "0px";
  return base;
});
const contentOuterStyle = computed(() => ({
  ...fragmentContentStyle.value,
  ...(props.decoration === "middle" || props.decoration === "bottom"
    ? { marginTop: "0px" }
    : paragraphSpacingStyle.value),
}));
// 经历条目头部只在首段渲染，正文续段不再重复头部
const showItemHeader = computed(() => !props.contentRange || props.contentRange.start === 0);
// 正文与头部的间距只计在首段，续段紧接上文，与分页高度口径一致
const itemContentSpacingStyle = computed(() => {
  if (props.decoration === "middle" || props.decoration === "bottom") return { marginTop: "0px" };
  return hasItemHeader.value ? innerSpacingStyle.value : paragraphSpacingStyle.value;
});
</script>

<template>
  <template v-if="node.type === 'richText'">
    <ModuleContentContainer
      v-if="richTextHtml"
      :style="contentOuterStyle"
      class="layout-rich-text"
      :class="`layout-rich-text--${decoration || 'full'}`"
    >
      <div
        class="break-words whitespace-pre-wrap"
        :style="{ textAlign: textAlign === 'justify' ? 'justify' : undefined }"
        v-html="richTextHtml"
      />
    </ModuleContentContainer>
  </template>

  <User v-else-if="node.type === 'group' && node.sourceModuleKey === 'user'" />

  <ModuleContentContainer
    v-else-if="node.type === 'group' && isExperience"
    :style="contentOuterStyle"
    class="layout-experience-item"
    data-layout-block-range
  >
    <!-- 块序：0 名称+时间 / 1 职位部门+城市 / 2 标签+链接 / 3 正文；块区间由测量层从 DOM 读到的块边界决定 -->
    <LayoutBlockRange :start="blockRange.start" :end="blockRange.end">
      <div
        v-if="hasItemHeader && showItemHeader"
        class="flex flex-wrap items-center justify-between gap-3"
      >
        <div class="min-w-0 flex-1">
          <ItemTitle :name="item.name" :emphasis="datePosition !== 'left'" />
        </div>
        <!-- 日期位置由 order 控制：置左时提到名称之前 -->
        <div
          class="flex max-w-full min-w-0 flex-wrap items-center"
          :class="datePosition === 'left' ? 'order-first' : ''"
        >
          <span
            :class="{ 'font-bold': datePosition === 'left' }"
            :style="datePosition === 'left' ? fontValue(1) : undefined"
          >
            {{ getTime(item.startTime, item.endTime, dateStyle) }}
          </span>
        </div>
      </div>
      <div
        v-if="hasItemHeader && showItemHeader"
        class="flex flex-wrap items-center justify-between gap-3"
        :style="innerSpacingStyle"
      >
        <div class="max-w-full min-w-0 flex-1">
          <InlineInfoList :items="[item.post, item.department]" />
        </div>
        <ResumeField :model-value="item.city" />
      </div>
      <div
        v-if="
          hasItemHeader &&
          showItemHeader &&
          (item.tags?.length || item.link?.name || item.link?.url)
        "
        class="flex flex-wrap items-center justify-between gap-3"
        :style="[innerSpacingStyle, paragraphSpacingStyle]"
      >
        <div class="flex flex-wrap items-center gap-3">
          <ItemTags :tags="item.tags" />
        </div>
        <a
          v-if="safeUrl(getItemLink(item).url)"
          :href="safeUrl(getItemLink(item).url)"
          target="_blank"
          rel="noopener noreferrer"
          class="inline max-w-full min-w-0 break-all hover:underline"
          :class="{ underline: linkUnderline }"
        >
          <ResumeField :model-value="getItemLink(item).name || getItemLink(item).url" />
        </a>
      </div>
      <!-- 正文作为一个块：内部段落由字符区间切分，保证块序与测量层一致 -->
      <div v-if="!isContentEmpty(item.content)" :style="itemContentSpacingStyle">
        <ResumeField :model-value="richTextHtml" html />
      </div>
    </LayoutBlockRange>
  </ModuleContentContainer>

  <template v-else-if="node.type === 'block'">
    <template v-if="node.sourceModuleKey === 'account'">
      <div class="flex max-w-full min-w-0 items-center" :style="paragraphSpacingStyle">
        <span v-if="item.name" class="shrink-0 whitespace-nowrap">
          <ItemTitle :name="item.name" class="inline-block" />
          <span v-if="item.url">：</span>
        </span>
        <!-- 链接需要 flex-1 + overflow-hidden 的包裹层，窄栏内才能截断溢出 -->
        <div class="flex min-w-0 flex-1 items-center overflow-hidden">
          <a
            :href="safeUrl(item.url)"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block max-w-full truncate whitespace-nowrap hover:underline"
            :class="{ underline: linkUnderline }"
          >
            <ResumeField
              :model-value="item.url"
              class="flex max-w-full items-center truncate whitespace-nowrap hover:underline"
              boxClass="truncate"
              :class="{ underline: linkUnderline }"
            />
          </a>
        </div>
      </div>
    </template>
    <div
      v-else-if="node.sourceModuleKey === 'honor'"
      class="inline-flex rounded-xl px-3 py-2"
      :style="{
        backgroundColor: themeColorSoft,
        color: themeColor,
        ...fontValue(),
        ...paragraphSpacingStyle,
      }"
    >
      <ResumeField :model-value="item.name" />
    </div>
    <ResumeField v-else :model-value="nodePayload.value" />
  </template>

  <template v-else-if="node.type === 'media'">
    <ModuleContentContainer>
      <div class="flex flex-col gap-3" :style="[paragraphSpacingStyle, mediaWidthStyle]">
        <img
          v-if="nodePayload.item?.img"
          :src="nodePayload.item.img"
          :alt="nodePayload.item.name || ''"
          class="max-w-full"
        />
        <a
          v-if="safeUrl(nodePayload.item?.url)"
          :href="safeUrl(nodePayload.item.url)"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:underline"
          :class="{ underline: linkUnderline }"
        >
          {{ nodePayload.item.name || nodePayload.item.url }}
        </a>
        <span v-if="nodePayload.item?.desc">{{ nodePayload.item.desc }}</span>
      </div>
    </ModuleContentContainer>
  </template>
</template>

<style scoped>
/* 正文富文本里写的链接，悬停时同样显示下划线 */
:deep(a:hover) {
  text-decoration: underline;
}

.layout-rich-text :deep(p),
.layout-rich-text :deep(ul),
.layout-rich-text :deep(ol) {
  margin: 0;
}

.layout-rich-text :deep(p + p),
.layout-rich-text :deep(ul + p),
.layout-rich-text :deep(p + ul),
.layout-rich-text :deep(ol + p),
.layout-rich-text :deep(p + ol) {
  margin-top: 0.75em;
}
</style>
