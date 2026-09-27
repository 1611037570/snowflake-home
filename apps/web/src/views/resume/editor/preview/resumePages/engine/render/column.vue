<script setup lang="ts">
import { computed } from "vue";
import type { LayoutNode } from "../types";
import type { ColumnPlan, FragmentPlan } from "../paginate/pagePlan";
import Module from "./module.vue";
import ModuleActions from "./moduleActions.vue";
import ModuleContent from "./moduleContent.vue";
import UserModule from "./userModule.vue";

const props = defineProps<{
  column: ColumnPlan;
  pageIndex: number;
  nodes: Map<string, LayoutNode>;
  isEdit?: boolean;
  showDebug?: boolean;
  moduleClassMap?: Record<string, string>;
  gap: number;
  /** 各模块可用的移动方向，由预览层按整栏跨页顺序计算 */
  moveDirections?: Record<string, { up: boolean; down: boolean }>;
  /** 当前栏是否存在相邻栏位，决定左右移动是否可用 */
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
}>();
const emit = defineEmits<{
  mouseenter: [moduleKey: string];
  click: [payload: { moduleKey: string; itemIndex?: number }];
  move: [payload: { moduleKey: string; direction: string }];
}>();
// 编辑操作归模块级渲染编排；个人信息模块固定位置，不提供移动方向。
const getMoveDirections = (moduleKey: string) => {
  if (moduleKey === "user") {
    return { up: false, down: false, left: false, right: false };
  }
  return {
    up: props.moveDirections?.[moduleKey]?.up ?? false,
    down: props.moveDirections?.[moduleKey]?.down ?? false,
    left: Boolean(props.canMoveLeft),
    right: Boolean(props.canMoveRight),
  };
};
// 模块间距只作用于不同模块，同一模块内的条目间距由内容样式控制
const getGapTop = (fragment: FragmentPlan, index: number) => {
  if (index === 0 || fragment.fragment === "middle" || fragment.fragment === "last") return 0;
  return props.column.fragments[index - 1]?.sourceModuleKey === fragment.sourceModuleKey
    ? 0
    : props.gap;
};
// 同一模块的连续分片归为一组：高亮轮廓按模块整体绘制，避免一个模块出现多个独立框
const fragmentGroups = computed(() => {
  const groups: Array<{
    key: string;
    moduleKey: string;
    gapTop: number;
    items: Array<{ fragment: FragmentPlan; columnIndex: number }>;
  }> = [];
  props.column.fragments.forEach((fragment, columnIndex) => {
    const lastGroup = groups[groups.length - 1];
    const item = { fragment, columnIndex };
    if (lastGroup && lastGroup.moduleKey === fragment.sourceModuleKey) {
      lastGroup.items.push(item);
      return;
    }
    groups.push({
      key: fragment.fragmentId,
      moduleKey: fragment.sourceModuleKey,
      gapTop: getGapTop(fragment, columnIndex),
      items: [item],
    });
  });
  return groups;
});
</script>

<template>
  <div class="flex min-w-0 flex-1 flex-col">
    <template v-for="(group, groupIndex) in fragmentGroups" :key="group.key">
      <div
        v-if="group.gapTop > 0"
        class="shrink-0"
        :class="{ 'resume-debug-gap': showDebug }"
        :style="{ height: `${group.gapTop}px` }"
      />
      <component
        :is="group.moduleKey === 'user' ? UserModule : Module"
        :module-key="group.moduleKey"
        :module-class="moduleClassMap?.[group.moduleKey]"
        @mouseenter="emit('mouseenter', $event)"
      >
        <template #actions>
          <ModuleActions
            v-if="isEdit"
            :model-key="group.moduleKey"
            :directions="getMoveDirections(group.moduleKey)"
            @move="emit('move', { moduleKey: group.moduleKey, direction: $event })"
          />
        </template>
        <ModuleContent
          :module-key="group.moduleKey"
          :items="group.items"
          :nodes="nodes"
          :page-index="pageIndex"
          :group-index="groupIndex"
          :show-debug="showDebug"
          @click="emit('click', $event)"
        />
      </component>
    </template>
    <!-- 下一个模块换页时，本页剩余空间仍装得下的模块间距落在页尾单独占一行 -->
    <div
      v-if="column.trailingGap > 0"
      class="shrink-0"
      :class="{ 'resume-debug-gap': showDebug }"
      :style="{ height: `${column.trailingGap}px` }"
    />
  </div>
</template>

<style scoped>
@reference "@/styles/tailwind.css";

/* 模块间距色带直接绘制在占位元素上 */
.resume-debug-gap {
  @apply bg-sf-warning;
}
</style>
