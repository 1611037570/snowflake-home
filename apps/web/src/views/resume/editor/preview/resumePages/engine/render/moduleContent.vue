<script setup lang="ts">
import { computed } from "vue";
import Title from "../../../components/title/index.vue";
import Item from "./item.vue";
import { getItemFragmentStyle, isItemNode } from "./itemStyle";
import LayoutNodeContent from "./layoutNodeContent.vue";
import { useResumePreviewContext } from "../../../shared/previewContext";
import type { LayoutNode } from "../types";
import type { FragmentPlan } from "../paginate/pagePlan";

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

const { ui } = useResumePreviewContext();
const itemConfig = computed(() => ui.value.item || {});
const getNode = (fragment: FragmentPlan) => props.nodes.get(fragment.sourceNodeId);
const getItemStyle = (fragment: FragmentPlan) =>
  getItemFragmentStyle(
    fragment.blockRange ?? { start: 0, end: Number.MAX_SAFE_INTEGER },
    fragment.contentRange,
    fragment.decoration,
    itemConfig.value.radius ?? "0",
  );
const handleContentClick = (node: LayoutNode) => {
  if (node.type === "spacer") return;
  emit("click", { moduleKey: props.moduleKey, itemIndex: node.sourceItemIndex });
};
const isLeadingOnPage = (itemIndex: number) =>
  props.pageIndex > 0 && props.groupIndex === 0 && itemIndex === 0;
</script>

<template>
  <!-- 普通模块与个人信息模块共用同一份标题和条目内容。 -->
  <template v-for="(entry, itemIndex) in items" :key="entry.fragment.fragmentId">
    <template v-if="getNode(entry.fragment)">
      <Title v-if="entry.fragment.titlePayload" :module-key="moduleKey" />
      <Item
        v-if="entry.fragment.fragment !== 'title' && isItemNode(getNode(entry.fragment)!)"
        :item="itemConfig"
        :style="getItemStyle(entry.fragment)"
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
      <div
        v-else-if="entry.fragment.fragment !== 'title'"
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
