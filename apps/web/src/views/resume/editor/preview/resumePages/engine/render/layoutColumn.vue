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
  /** 当前栏在区域中的位置与总栏数，用于决定左右移动是否可用 */
  columnIndex?: number;
  columnCount?: number;
}>();
const emit = defineEmits<{
  mouseenter: [moduleKey: string];
  move: [payload: { moduleKey: string; targetModuleKey: string | null; direction: string }];
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
// 移动方向：上下限同栏相邻模块（个人信息模块不能被替换），左右限存在相邻栏位
const getDirections = (groupIndex: number) => {
  const groups = fragmentGroups.value;
  const prev = groups[groupIndex - 1];
  return {
    up: Boolean(prev && prev.moduleKey !== "user"),
    down: groupIndex < groups.length - 1,
    left: false,
    right: false,
  };
};
// 上下移动交给上层交换模块顺序，左右移动需要换栏，由上层处理
const handleMove = (groupIndex: number, direction: string) => {
  const groups = fragmentGroups.value;
  const group = groups[groupIndex];
  if (!group) return;
  const target =
    direction === "up" ? groups[groupIndex - 1] : direction === "down" ? groups[groupIndex + 1] : null;
  emit("move", {
    moduleKey: group.moduleKey,
    targetModuleKey: target?.moduleKey ?? null,
    direction,
  });
};
</script>

<template>
  <div class="flex min-w-0 flex-1 flex-col">
    <div
      v-for="(group, groupIndex) in fragmentGroups"
      :key="group.key"
      class="group/module relative flex min-w-0 flex-col"
      :class="moduleClassMap?.[group.moduleKey]"
    >
      <!-- 模块级操作按钮按模块渲染一次，避免多条目模块出现多个图标 -->
      <ModuleActions
        v-if="isEdit"
        :model-key="group.moduleKey"
        :directions="getDirections(groupIndex)"
        @move="handleMove(groupIndex, $event)"
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
