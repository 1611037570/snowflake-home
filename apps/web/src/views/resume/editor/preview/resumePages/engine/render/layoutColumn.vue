<script setup lang="ts">
import { computed } from "vue";
import ModuleActions from "../../moduleActions.vue";
import type { LayoutNode } from "../types";
import type { ColumnPlan, FragmentPlan } from "../paginate/pagePlan";
import LayoutFragment from "./layoutFragment.vue";

const props = defineProps<{
  column: ColumnPlan;
  nodes: Map<string, LayoutNode>;
  isEdit?: boolean;
  moduleClassMap?: Record<string, string>;
  gap: number;
  /** 各模块可用的移动方向，由预览层按整栏跨页顺序计算 */
  moveDirections?: Record<string, { up: boolean; down: boolean }>;
}>();
const emit = defineEmits<{
  mouseenter: [moduleKey: string];
  move: [payload: { moduleKey: string; direction: string }];
}>();

const getNode = (fragment: FragmentPlan) => props.nodes.get(fragment.sourceNodeId);
// 同一节点的续段之间不留模块间距，让分片在页面上连成一块，与分页高度口径一致
const getGapTop = (fragment: FragmentPlan, index: number) =>
  index === 0 || fragment.fragment === "middle" || fragment.fragment === "last" ? 0 : props.gap;
// 同一模块的连续分片归为一组：高亮轮廓按模块整体绘制，避免一个模块出现多个独立框
const fragmentGroups = computed(() => {
  const groups: Array<{
    key: string;
    moduleKey: string;
    items: Array<{ fragment: FragmentPlan; columnIndex: number }>;
  }> = [];
  props.column.fragments.forEach((fragment, columnIndex) => {
    const lastGroup = groups[groups.length - 1];
    const item = { fragment, columnIndex };
    if (lastGroup && lastGroup.moduleKey === fragment.sourceModuleKey) {
      lastGroup.items.push(item);
      return;
    }
    groups.push({ key: fragment.fragmentId, moduleKey: fragment.sourceModuleKey, items: [item] });
  });
  return groups;
});
// 移动方向：由预览层按整栏跨页顺序下发；续段不提供移动，避免与模块首段重复
const getDirections = (group) => {
  const kind = group.items[0]?.fragment?.fragment;
  if (kind === "middle" || kind === "last") {
    return { up: false, down: false, left: false, right: false };
  }
  return props.moveDirections?.[group.moduleKey] ?? { up: false, down: false, left: false, right: false };
};
// 上下移动交给上层按整栏顺序交换模块位置
const handleMove = (moduleKey: string, direction: string) => {
  emit("move", { moduleKey, direction });
};
</script>

<template>
  <div class="flex min-w-0 flex-1 flex-col">
    <div
      v-for="group in fragmentGroups"
      :key="group.key"
      class="group/module relative flex min-w-0 flex-col"
      :class="moduleClassMap?.[group.moduleKey]"
    >
      <!-- 模块级操作按钮按模块渲染一次，避免多条目模块出现多个图标 -->
      <ModuleActions
        v-if="isEdit"
        :model-key="group.moduleKey"
        :directions="getDirections(group)"
        @move="handleMove(group.moduleKey, $event)"
      />
      <template v-for="item in group.items" :key="item.fragment.fragmentId">
        <LayoutFragment
          v-if="getNode(item.fragment)"
          :fragment="item.fragment"
          :node="getNode(item.fragment)!"
          :gap-top="getGapTop(item.fragment, item.columnIndex)"
          @mouseenter="emit('mouseenter', $event)"
        />
      </template>
    </div>
  </div>
</template>
