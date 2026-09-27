<script setup lang="ts">
import LayoutMeasureHost from "./layoutMeasureHost.vue";
import LayoutMeasureNode from "./layoutMeasureNode.vue";
import { PAGE_NUMBER_HEIGHT } from "../../../shared/constants";
import type { LayoutNode } from "../types";

defineProps<{
  /** 测量宿主宽度，等于页面内容宽度 */
  width: number;
  /** 按栏位分组的节点：每个分组按自己的栏宽渲染，保证测量宽度与真实排版一致 */
  groups: Array<{ id: string; width: number; nodes: LayoutNode[] }>;
  rootStyle?: Record<string, string>;
  rootClass?: string;
  showPageNumber?: boolean;
  footerText?: string;
  onMeasureEl?: (element: HTMLElement | null) => void;
}>();
</script>

<template>
  <LayoutMeasureHost :width="width" :root-style="rootStyle" :class-name="rootClass" :on-measure-el="onMeasureEl">
    <div
      v-for="group in groups"
      :key="group.id"
      class="flex flex-col"
      :style="{ width: `${group.width}px` }"
    >
      <LayoutMeasureNode v-for="node in group.nodes" :key="node.id" :node="node" />
    </div>
    <div
      v-if="showPageNumber"
      class="flex flex-1 items-end justify-center py-3 text-xs opacity-50"
      :style="{ height: `${PAGE_NUMBER_HEIGHT}px` }"
    >
      {{ footerText }}
    </div>
  </LayoutMeasureHost>
</template>

<style scoped>
.layout-measure-tree {
  width: 100%;
}
</style>
