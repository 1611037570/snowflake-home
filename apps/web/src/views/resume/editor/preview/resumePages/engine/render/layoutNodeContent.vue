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

const safeUrlProtocols = new Set(["http:", "https:", "mailto:"]);

interface Props {
  node: LayoutNode;
  payload?: unknown;
  contentRange?: { start: number; end: number };
  /** 块区间：只渲染该区间内的块，区间由测量层从真实 DOM 读到的块边界给出 */
  blockRange?: { start: number; end: number };
  decoration?: "full" | "top" | "middle" | "bottom";
  showDebug?: boolean;
  /** 当前分片是否位于所在页面的第一位：此时不绘制顶部间距占位 */
  leadingOnPage?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  blockRange: () => ({ start: 0, end: Number.MAX_SAFE_INTEGER }),
});

const {
  theme: {
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
// 描述按行拆分：分片只渲染自己区间内的文本，放不下的行移到下一页而不是整块被推走
const slicedItemDesc = computed(() => {
  const desc = String(nodePayload.value?.item?.desc || "");
  if (!props.contentRange) return desc;
  return desc.slice(props.contentRange.start, props.contentRange.end);
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
const hasItemMeta = computed(() => {
  const value = item.value;
  return Boolean(value.tags?.length || value.link?.name || value.link?.url);
});
const bodyBlockIndex = computed(
  () => (hasItemHeader.value ? 2 : 0) + (hasItemMeta.value ? 1 : 0),
);
const isBlockVisible = (index: number) =>
  index >= props.blockRange.start && index < props.blockRange.end;
// 间距分片的块区间是 [0, 0)，此时不渲染内容盒，避免只剩顶部间距的空盒把页面撑高
const hasContentBlock = computed(() => props.blockRange.end > 0);
const getItemLink = (value: any) => {
  const link = value?.link;
  if (typeof link === "string") return { name: "", url: link.trim() };
  return {
    name: String(link?.name || "").trim(),
    url: String(link?.url || "").trim(),
  };
};
const itemLink = computed(() => getItemLink(item.value));
const safeUrl = (value: unknown) => {
  try {
    const url = new URL(String(value || "").trim());
    return safeUrlProtocols.has(url.protocol.toLowerCase()) ? url.href : "";
  } catch {
    return "";
  }
};
const safeItemLinkUrl = computed(() => safeUrl(itemLink.value.url));
const fragmentContentStyle = computed(() => {
  const base = { ...moduleContentStyle.value };
  // 分片的圆角与相邻边框按上下拼接分配：两端都在本片时保留完整圆角
  const radius = String((moduleContentStyle.value as { borderRadius?: string }).borderRadius || "0");
  // 内容盒首块已在前面分片渲染过时，续段才去掉上内边距与上边框；只放间距的分片不渲染内容盒
  const boxTopRendered = props.blockRange.start > 0 || (props.contentRange?.start ?? 0) > 0;
  const boxBottomFinal = props.decoration !== "top" && props.decoration !== "middle";
  const topRadius = boxTopRendered ? "0" : radius;
  const bottomRadius = boxBottomFinal ? radius : "0";
  base.borderRadius = `${topRadius} ${topRadius} ${bottomRadius} ${bottomRadius}`;
  if (boxTopRendered) {
    base.paddingTop = "0px";
    base.borderTopWidth = "0px";
  }
  if (!boxBottomFinal) {
    base.paddingBottom = "0px";
    base.borderBottomWidth = "0px";
  }
  return base;
});
const spacerHeight = computed(() => Number(nodePayload.value?.height) || 0);
// 经历条目头部只在首段渲染，正文续段不再重复头部
const showItemHeader = computed(() => !props.contentRange || props.contentRange.start === 0);
// 正文与头部的间距只计在首段，续段紧接上文，与分页高度口径一致
const itemContentSpacingStyle = computed(() => {
  if (props.decoration === "middle" || props.decoration === "bottom") return { marginTop: "0px" };
  return hasItemHeader.value ? innerSpacingStyle.value : { marginTop: "0px" };
});
</script>

<template>
  <template v-if="node.type === 'spacer'">
    <div
      v-if="!leadingOnPage"
      class="shrink-0"
      :class="{ 'resume-debug-paragraph-gap': showDebug }"
      :style="{ height: `${spacerHeight}px` }"
    />
  </template>
  <template v-else-if="node.type === 'richText'">
    <ModuleContentContainer
      v-if="richTextHtml && hasContentBlock"
      :style="fragmentContentStyle"
      class="layout-rich-text"
      :class="`layout-rich-text--${decoration || 'full'}`"
      data-layout-block-range
    >
      <div
        class="break-words whitespace-pre-wrap"
        :style="{ textAlign: textAlign === 'justify' ? 'justify' : undefined }"
        v-html="richTextHtml"
      />
    </ModuleContentContainer>
  </template>

  <template v-else-if="node.type === 'group' && node.sourceModuleKey === 'user'">
    <User />
  </template>

  <template v-else-if="node.type === 'group' && isExperience">
    <ModuleContentContainer
      v-if="hasContentBlock"
      :style="fragmentContentStyle"
      class="layout-experience-item"
      data-layout-block-range
    >
    <!-- 块区间按实际存在的头部、标签链接和正文顺序，与测量层 DOM 块序保持一致 -->
    <div
      v-if="hasItemHeader && showItemHeader && isBlockVisible(0)"
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
      v-if="hasItemHeader && showItemHeader && isBlockVisible(1)"
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
        hasItemMeta &&
        isBlockVisible(2)
      "
      class="flex flex-wrap items-center justify-between gap-3"
      :style="innerSpacingStyle"
    >
      <div class="flex flex-wrap items-center gap-3">
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
    </ModuleContentContainer>
  </template>

  <template v-else-if="node.type === 'block'">
    <template v-if="node.sourceModuleKey === 'account'">
      <div class="flex max-w-full min-w-0 items-center">
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
    <template v-else-if="node.sourceModuleKey === 'honor'">
      <div
        class="inline-flex rounded-xl px-3 py-2"
        :style="{
          backgroundColor: themeColorSoft,
          color: themeColor,
          ...fontValue(),
        }"
      >
        <ResumeField :model-value="item.name" />
      </div>
    </template>
    <ResumeField v-else :model-value="nodePayload.value" />
  </template>

  <template v-else-if="node.type === 'media'">
    <ModuleContentContainer
      v-if="hasContentBlock"
      data-layout-block-range
      :style="fragmentContentStyle"
    >
      <template v-if="nodePayload.mediaType === 'video'">
        <!-- 视频作品保留原始网址文本，避免显示为作品名称。 -->
        <div
          v-if="isBlockVisible(0)"
          class="flex h-auto max-w-full min-w-0 flex-wrap items-center justify-between gap-3"
        >
          <div class="min-w-0 flex-1" :style="fontValue()">
            <ItemTitle v-if="nodePayload.item?.name" :name="nodePayload.item.name" />
          </div>
          <div v-if="safeUrl(nodePayload.item?.url)" class="max-w-[45%] min-w-0 shrink-0 text-right">
            <a
              :href="safeUrl(nodePayload.item.url)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline max-w-full min-w-0 break-all hover:underline"
              :class="{ underline: linkUnderline }"
            >
              <ResumeField :model-value="nodePayload.item.url" class="inline max-w-full min-w-0 break-all" />
            </a>
          </div>
        </div>
        <div
          v-if="nodePayload.item?.desc && isBlockVisible(1)"
          data-layout-split-lines
          :style="decoration === 'middle' || decoration === 'bottom' ? undefined : innerSpacingStyle"
        >
          <ResumeField :model-value="slicedItemDesc" />
        </div>
      </template>
      <template v-else>
        <!-- 图片条目内容盒整体作为一个块，与顶部间距分离后间距可以单独留在上一页 -->
        <div class="flex flex-col gap-3" :style="mediaWidthStyle">
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
            class="block text-center hover:underline"
            :class="{ underline: linkUnderline }"
            >
            {{ nodePayload.item.name || nodePayload.item.url }}
          </a>
          <span
            v-else-if="nodePayload.item?.name"
            class="block text-center"
          >{{ nodePayload.item.name }}</span>
          <span v-if="nodePayload.item?.desc">{{ nodePayload.item.desc }}</span>
        </div>
      </template>
    </ModuleContentContainer>
  </template>
</template>

<style scoped>
@reference "@/styles/tailwind.css";

/* 段落间距色带直接绘制在独立占位行上 */
.resume-debug-paragraph-gap {
  @apply bg-sf-theme;
}

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

/* 空段落保留一行；不额外叠加空行前后的段落间距，给正文尽量多留可用行高 */
.layout-rich-text :deep(p:has(> br:only-child)),
.layout-rich-text :deep(p:has(> br:only-child) + p) {
  margin-top: 0;
}
</style>
