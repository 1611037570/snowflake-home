<script setup lang="ts">
import { computed } from "vue";
import Item from "@/views/resume/theme/components/itemContainer/index.vue";
import { isItemNode, isTitleNode } from "./itemStyle";
import LayoutNodeContent from "./layoutNodeContent.vue";
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

const getNode = (fragment: FragmentPlan) => props.nodes.get(fragment.sourceNodeId);
const handleContentClick = (node: LayoutNode) => {
  if (node.type === "spacer") return;
  // 标语属于版头区域，不响应点击，不触发编辑区定位。
  if (props.moduleKey === "slogan") return;
  // 派生求职信息复用个人信息编辑入口，不寻找不存在的独立表单。
  emit("click", { moduleKey: props.moduleKey === "userFacts" ? "user" : props.moduleKey, itemIndex: node.sourceItemIndex });
};
const isLeadingOnPage = (itemIndex: number) =>
  props.pageIndex > 0 && props.groupIndex === 0 && itemIndex === 0;
// 个人信息与标语属于版头区域，不参与条目悬停反馈；其余模块悬停只显示背景色，不带圆角
const hoverBackgroundClass = computed(() =>
  props.moduleKey === "user" || props.moduleKey === "slogan" ? "" : "hover:bg-sf-theme-2!",
);
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
        :node-type="getNode(entry.fragment)!.type"
        class="resume-submodule-content relative"
        :class="hoverBackgroundClass"
        data-layout-block-range
        @click.stop="handleContentClick(getNode(entry.fragment)!)"
        v-slot="{ dateRail }"
      >
        <LayoutNodeContent
          :node="getNode(entry.fragment)!"
          :date-rail="dateRail"
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
            : ['resume-submodule-content relative', hoverBackgroundClass]
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
