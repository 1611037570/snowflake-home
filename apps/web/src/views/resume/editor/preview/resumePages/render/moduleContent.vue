<script setup lang="ts">
import Item from "@/views/resume/theme/components/itemContainer/index.vue";
import { isItemNode, isTimelineNode, isTitleNode } from "./itemStyle";
import LayoutNodeContent from "./layoutNodeContent.vue";
import { useResumePreviewContext } from "../../shared/previewContext";
import type { LayoutNode } from "../engine/types";
import type { FragmentPlan } from "../engine/paginate/pagePlan";

const props = defineProps<{
  moduleKey: string;
  items: Array<{ fragment: FragmentPlan; columnIndex: number }>;
  nodes: Map<string, LayoutNode>;
  pageIndex: number;
  groupIndex: number;
  showDebug?: boolean;
}>();
const emit = defineEmits<{
  click: [payload: { moduleKey: string; itemIndex?: number }];
}>();

const { theme } = useResumePreviewContext();
const getNode = (fragment: FragmentPlan) => props.nodes.get(fragment.sourceNodeId);
const handleContentClick = (node: LayoutNode) => {
  if (node.type === "spacer") return;
  emit("click", { moduleKey: props.moduleKey, itemIndex: node.sourceItemIndex });
};
const isLeadingOnPage = (itemIndex: number) =>
  props.pageIndex > 0 && props.groupIndex === 0 && itemIndex === 0;
</script>

<template>
  <!-- 普通模块与个人信息模块共用同一份条目内容；模块标题由独立节点渲染。 -->
  <template v-for="(entry, itemIndex) in items" :key="entry.fragment.fragmentId">
    <template v-if="getNode(entry.fragment)">
      <Item
        v-if="isItemNode(getNode(entry.fragment)!)"
        :block-range="entry.fragment.blockRange"
        :content-range="entry.fragment.contentRange"
        :decoration="entry.fragment.decoration"
        :timeline="isTimelineNode(getNode(entry.fragment)!, theme.themeTemplate.value)"
        class="resume-submodule-content relative rounded-3xl hover:bg-sf-theme-2!"
        data-layout-block-range
        @click.stop="handleContentClick(getNode(entry.fragment)!)"
      >
        <LayoutNodeContent
          :node="getNode(entry.fragment)!"
          :payload="entry.fragment.payload"
          :content-range="entry.fragment.contentRange"
          :block-range="entry.fragment.blockRange"
          :decoration="entry.fragment.decoration"
          :show-debug="showDebug"
          :leading-on-page="isLeadingOnPage(itemIndex)"
        />
      </Item>
      <div v-else-if="isTitleNode(getNode(entry.fragment)!)">
        <!-- 模块标题是排版元素：不带悬停背景，也不参与点击定位 -->
        <LayoutNodeContent
          :node="getNode(entry.fragment)!"
          :payload="entry.fragment.payload"
          :content-range="entry.fragment.contentRange"
          :block-range="entry.fragment.blockRange"
          :decoration="entry.fragment.decoration"
          :show-debug="showDebug"
          :leading-on-page="isLeadingOnPage(itemIndex)"
        />
      </div>
      <div
        v-else
        @click.stop="handleContentClick(getNode(entry.fragment)!)"
        :class="
          getNode(entry.fragment)!.type === 'spacer'
            ? ''
            : 'resume-submodule-content relative rounded-3xl hover:bg-sf-theme-2!'
        "
      >
        <LayoutNodeContent
          :node="getNode(entry.fragment)!"
          :payload="entry.fragment.payload"
          :content-range="entry.fragment.contentRange"
          :block-range="entry.fragment.blockRange"
          :decoration="entry.fragment.decoration"
          :show-debug="showDebug"
          :leading-on-page="isLeadingOnPage(itemIndex)"
        />
      </div>
    </template>
  </template>
</template>
