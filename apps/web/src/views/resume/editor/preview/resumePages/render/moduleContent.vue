<script setup lang="ts">
import { computed } from "vue";
import { isTitleNode } from "./itemStyle";
import NodeFragment from "./nodeFragment.vue";
import type { LayoutNode } from "../engine/types";
import type { FragmentPlan } from "../engine/paginate/pagePlan";

const props = defineProps<{
  moduleKey: string;
  nodeRole?: "all" | "title" | "content"; // 当前槽渲染全部节点、仅标题或仅正文
  items: FragmentPlan[]; // 当前模块分片，不再包装无用栏内索引
  nodes: Map<string, LayoutNode>;
  showDebug?: boolean;
  isEdit?: boolean; // 是否编辑态预览，只读预览不显示条目悬停反馈
  editingItemIndex?: number | null; // 当前编辑子模块下标，空值不显示子模块提示
}>();
const emit = defineEmits<{
  click: [payload: { moduleKey: string; itemIndex?: number }];
}>();

const getNode = (fragment: FragmentPlan) => props.nodes.get(fragment.sourceNodeId);
// 槽位只分离标题与正文，保留分片自身的分页信息。
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
// 个人信息与标语属于版头区域，不参与条目悬停反馈；其余模块仅在编辑态悬停显示背景色，只读预览不显示
const hoverBackgroundClass = computed(() =>
  props.isEdit && props.moduleKey !== "user" && props.moduleKey !== "slogan"
    ? "hover:bg-sf-theme-3!"
    : "",
);
// 子模块可能跨页或拆成多个节点，每页只在首个命中分片上显示提示。
const isEditingFragment = (fragment: FragmentPlan) =>
  props.isEdit &&
  props.editingItemIndex != null &&
  getNode(fragment)?.sourceItemIndex === props.editingItemIndex;
const editingLabelFragmentId = computed(
  () => props.items.find(isEditingFragment)?.fragmentId ?? "",
);
const getFragmentClass = (fragment: FragmentPlan) => [
  "resume-submodule-content relative",
  hoverBackgroundClass.value,
  isEditingFragment(fragment) &&
    "resume-submodule-editing outline-2 outline-offset-3 outline-dashed outline-sf-theme",
];
</script>

<template>
  <!-- 测量与预览共用节点外框和正文分发，模块这里只编排分片与交互。 -->
  <template v-for="fragment in items" :key="fragment.fragmentId">
    <NodeFragment
      v-if="acceptsNode(fragment)"
      :node="getNode(fragment)!"
      :payload="fragment.payload"
      :content-range="fragment.contentRange"
      :block-range="fragment.blockRange"
      :decoration="fragment.decoration"
      :show-debug="showDebug"
      :leading-on-page="fragment.leadingOnPage"
      :class="isTitleNode(getNode(fragment)!) || getNode(fragment)!.type === 'spacer' ? undefined : getFragmentClass(fragment)"
      :data-editing-label="fragment.fragmentId === editingLabelFragmentId ? $t('editingModule') : undefined"
      @click.stop="handleContentClick(getNode(fragment)!)"
    />
  </template>
</template>

<style scoped>
/* 子模块提示贴近当前记录顶部，避免长模块只能在模块起点看到编辑状态。 */
:global(.resume-submodule-editing[data-editing-label]::before) {
  content: attr(data-editing-label);
  position: absolute;
  top: -3px;
  left: -5px;
  z-index: 10;
  padding: 0 0.75rem;
  border-radius: 0.75rem 0.75rem 0 0;
  background: var(--color-sf-theme);
  color: var(--color-sf-theme-text);
  font-size: 0.75rem;
  line-height: 1.5rem;
  pointer-events: none;
  transform: translateY(-100%);
}
</style>
