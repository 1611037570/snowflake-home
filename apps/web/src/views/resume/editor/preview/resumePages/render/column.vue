<script setup lang="ts">
import { computed } from "vue";
import type { LayoutNode } from "../engine/types";
import type { ColumnPlan, FragmentPlan } from "../engine/paginate/pagePlan";
import ModuleActions from "./moduleActions.vue";
import ModuleContent from "./moduleContent.vue";
import ModuleFrame from "./moduleFrame.vue";

const props = defineProps<{
  column: ColumnPlan;
  nodes: Map<string, LayoutNode>;
  isEdit?: boolean;
  showDebug?: boolean;
  moduleClassMap?: Record<string, string>;
  selectedModuleKeys?: string[];
  /** 当前编辑模块标识，仅用于编辑态提示 */
  editingModuleKey?: string | null;
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
  select: [moduleKey: string];
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
    items: FragmentPlan[]; // 同一模块的连续分片
  }> = [];
  props.column.fragments.forEach((fragment, columnIndex) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.moduleKey === fragment.sourceModuleKey) {
      lastGroup.items.push(fragment);
      return;
    }
    groups.push({
      key: fragment.fragmentId,
      moduleKey: fragment.sourceModuleKey,
      gapTop: getGapTop(fragment, columnIndex),
      items: [fragment],
    });
  });
  return groups;
});
</script>

<template>
  <!-- 栏内容标识供主题按实际内容高度绘制贯穿装饰。 -->
  <div data-resume-column-content class="resume-column flex min-w-0 flex-1 flex-col">
    <template v-for="group in fragmentGroups" :key="group.key">
      <div
        v-if="group.gapTop > 0"
        class="shrink-0"
        :class="{ 'resume-debug-gap': showDebug }"
        :style="{ height: `${group.gapTop}px` }"
      />
      <ModuleFrame
        :module-key="group.moduleKey"
        :module-class="moduleClassMap?.[group.moduleKey]"
        @mouseenter="emit('mouseenter', $event)"
      >
        <template #actions>
          <!-- 编辑提示对齐轮廓外沿并置于框线上方，导出时随编辑操作移除。 -->
          <span
            v-if="isEdit && editingModuleKey === group.moduleKey"
            data-resume-editor-action
            class="pointer-events-none absolute -top-[3px] -left-[5px] z-10 -translate-y-full rounded-t-xl bg-sf-theme px-3 text-xs leading-6 text-sf-theme-text"
            >{{ $t("editingModule") }}</span
          >
          <!-- 标语属于版头区域，不提供任何模块操作按钮 -->
          <ModuleActions
            v-if="isEdit && group.moduleKey !== 'slogan'"
            :selected="selectedModuleKeys?.includes(group.moduleKey)"
            :directions="getMoveDirections(group.moduleKey)"
            @move="emit('move', { moduleKey: group.moduleKey, direction: $event })"
            @toggle-select="emit('select', group.moduleKey)"
          />
        </template>
        <!-- 同一模块的标题独立交给外壳，正文条目仍共用原始分片列表。 -->
        <template #title>
          <ModuleContent
            node-role="title"
            :module-key="group.moduleKey"
            :items="group.items"
            :nodes="nodes"
            :show-debug="showDebug"
          />
        </template>
        <ModuleContent
          node-role="content"
          :module-key="group.moduleKey"
          :items="group.items"
          :nodes="nodes"
          :show-debug="showDebug"
          @click="emit('click', $event)"
        />
      </ModuleFrame>
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
