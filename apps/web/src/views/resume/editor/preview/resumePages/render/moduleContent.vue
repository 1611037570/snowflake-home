<script setup lang="ts">
import { computed } from "vue";
import { isTitleNode } from "./itemStyle";
import NodeFragment from "./nodeFragment.vue";
import type { LayoutNode } from "../engine/types";
import type { FragmentPlan } from "../engine/paginate/pagePlan";

const props = defineProps<{
  moduleKey: string;
  nodeRole?: "all" | "title" | "content"; // 当前槽渲染全部节点、仅标题或仅正文
  items: Array<{ fragment: FragmentPlan; columnIndex: number }>;
  nodes: Map<string, LayoutNode>;
  pageIndex: number;
  groupIndex: number;
  showDebug?: boolean;
}>();
const emit = defineEmits<{
  click: [payload: { moduleKey: string; itemIndex?: number }];
}>();

const getNode = (fragment: FragmentPlan) => props.nodes.get(fragment.sourceNodeId);
// 槽位只分离标题与正文，保留分片原始索引和分页信息。
const acceptsNode = (fragment: FragmentPlan) => {
  const node = getNode(fragment);
  if (!node) return false;
  return !props.nodeRole || props.nodeRole === "all" ||
    (props.nodeRole === "title" ? isTitleNode(node) : !isTitleNode(node));
};
const handleContentClick = (node: LayoutNode) => {
  if (node.type === "spacer") return;
  // 标语属于版头区域，不响应点击，不触发编辑区定位。
  if (props.moduleKey === "slogan") return;
  emit("click", { moduleKey: props.moduleKey, itemIndex: node.sourceItemIndex });
};
// 页首口径与分页计高共用同一标记，零高度分片不会阻止间距隐藏。
const isLeadingOnPage = (itemIndex: number) =>
  Boolean(props.items[itemIndex]?.fragment.leadingOnPage);
// 个人信息与标语属于版头区域，不参与条目悬停反馈；其余模块悬停只显示背景色，不带圆角
const hoverBackgroundClass = computed(() =>
  props.moduleKey === "user" || props.moduleKey === "slogan" ? "" : "hover:bg-sf-theme-2!",
);
</script>

<template>
  <!-- 测量与预览共用节点外框和正文分发，模块这里只编排分片与交互。 -->
  <template v-for="(entry, itemIndex) in items" :key="entry.fragment.fragmentId">
    <NodeFragment
      v-if="acceptsNode(entry.fragment)"
      :node="getNode(entry.fragment)!"
      :payload="entry.fragment.payload"
      :content-range="entry.fragment.contentRange"
      :block-range="entry.fragment.blockRange"
      :decoration="entry.fragment.decoration"
      :show-debug="showDebug"
      :leading-on-page="isLeadingOnPage(itemIndex)"
      :class="isTitleNode(getNode(entry.fragment)!) || getNode(entry.fragment)!.type === 'spacer' ? undefined : ['resume-submodule-content relative', hoverBackgroundClass]"
      @click.stop="handleContentClick(getNode(entry.fragment)!)"
    />
  </template>
</template>
