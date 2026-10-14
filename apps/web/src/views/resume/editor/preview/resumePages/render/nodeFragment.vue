<script setup lang="ts">
import { computed, defineComponent, mergeProps, useAttrs } from "vue";
import Item from "@/views/resume/theme/components/itemContainer/index.vue";
import LayoutNodeContent from "./layoutNodeContent.vue";
import { isItemNode } from "./itemStyle";
import type { NodeContentProps } from "./nodeContentContract";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<NodeContentProps & {
  measurement?: boolean; // 测量探针使用无额外盒子的普通节点外框
}>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
  decoration: "full", // 完整节点默认展示全部外观
});
const attrs = useAttrs();
// 测量的普通节点保持原有无包装结构，避免额外盒子影响块边界。
const PlainFrame = defineComponent({
  setup: (_, { slots }) => () => slots.default?.({ dateRail: false /* 不使用固定日期栏 */ }),
});
const usesItem = computed(() => isItemNode(props.node));
// 外框选择只在公共分片入口维护一次，不在测量与预览分别实现。
const frame = computed(() => usesItem.value ? Item
  : props.measurement ? PlainFrame : "div");
const frameProps = computed(() => usesItem.value ? {
  blockRange: props.blockRange, // 外框覆盖的稳定内容块
  contentRange: props.contentRange, // 外框覆盖的字符区间
  decoration: props.decoration, // 外框分片阶段
  nodeType: props.node.type, // 外框的日期栏启用条件
  itemIndex: props.node.sourceItemIndex ?? 0, // 条目原始序号供主题稳定交替装饰
  "data-layout-block-range": "", // 测量层读取的直接内容块边界
} : {});
const contentProps = computed(() => {
  const { measurement: _measurement, ...content } = props;
  return content;
});
</script>

<template>
  <component :is="frame" v-bind="mergeProps(frameProps, attrs)" v-slot="frameSlot">
    <LayoutNodeContent v-bind="contentProps" :date-rail="frameSlot?.dateRail ?? dateRail" />
  </component>
</template>
