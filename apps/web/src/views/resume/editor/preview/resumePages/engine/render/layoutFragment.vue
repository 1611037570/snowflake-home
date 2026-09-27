<script setup lang="ts">
import { computed } from "vue";
import Item from "../../../components/item.vue";
import { getItemFragmentStyle, isItemNode } from "../../../components/itemStyle";
import Title from "../../../components/title/index.vue";
import type { LayoutNode } from "../types";
import type { FragmentPlan } from "../paginate/pagePlan";
import LayoutNodeContent from "./layoutNodeContent.vue";
import { useResumePreviewContext } from "../../../shared/previewContext";

const props = defineProps<{
  fragment: FragmentPlan;
  node: LayoutNode;
  showDebug?: boolean;
  /** 当前分片是否位于所在页面的第一位：此时不绘制顶部间距占位 */
  leadingOnPage?: boolean;
}>();

const { ui } = useResumePreviewContext();
const itemConfig = computed(() => ui.value.item || {});
// 除 user 与分页间距外，每个内容节点都作为独立条目渲染。
const useItem = computed(() => isItemNode(props.node));
const itemFragmentStyle = computed(() =>
  getItemFragmentStyle(
    props.fragment.blockRange ?? { start: 0, end: Number.MAX_SAFE_INTEGER },
    props.fragment.contentRange,
    props.fragment.decoration,
    itemConfig.value.radius ?? "0",
  ),
);

const emit = defineEmits<{
  click: [payload: { moduleKey: string; itemIndex?: number }];
}>();

const handleContentClick = () => {
  if (props.node.type === "spacer") return;
  emit("click", {
    moduleKey: props.fragment.sourceModuleKey,
    itemIndex: props.node.sourceItemIndex,
  });
};
</script>

<template>
  <Title v-if="fragment.titlePayload" :module-key="fragment.sourceModuleKey" />
  <Item
    v-if="fragment.fragment !== 'title' && useItem"
    :item="itemConfig"
    :style="itemFragmentStyle"
    class="resume-submodule-content relative rounded-3xl hover:bg-sf-theme-2!"
    data-layout-block-range
    @click.stop="handleContentClick"
  >
    <LayoutNodeContent
      :node="node"
      :payload="fragment.payload"
      :content-range="fragment.contentRange"
      :block-range="fragment.blockRange"
      :decoration="fragment.decoration"
      :show-debug="showDebug"
      :leading-on-page="leadingOnPage"
    />
  </Item>
  <div
    v-else-if="fragment.fragment !== 'title'"
    @click.stop="handleContentClick"
    :class="
      node.type === 'spacer'
        ? ''
        : 'resume-submodule-content relative rounded-3xl hover:bg-sf-theme-2!'
    "
  >
    <LayoutNodeContent
      :node="node"
      :payload="fragment.payload"
      :content-range="fragment.contentRange"
      :block-range="fragment.blockRange"
      :decoration="fragment.decoration"
      :show-debug="showDebug"
      :leading-on-page="leadingOnPage"
    />
  </div>
</template>
