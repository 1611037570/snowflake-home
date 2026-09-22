<script setup lang="ts">
import LayoutMeasureHost from "./layoutMeasureHost.vue";
import LayoutMeasureNode from "./layoutMeasureNode.vue";
import type { LayoutNode } from "../types";

const props = defineProps<{
  nodes: LayoutNode[];
  width: number;
  rootStyle?: Record<string, string>;
  rootClass?: string;
  onMeasureEl?: (element: HTMLElement | null) => void;
}>();
</script>

<template>
  <LayoutMeasureHost :width="width" :root-style="rootStyle" :class-name="rootClass" :on-measure-el="onMeasureEl">
    <div class="flex flex-col w-full">
      <LayoutMeasureNode v-for="node in nodes" :key="node.id" :node="node" />
    </div>
  </LayoutMeasureHost>
</template>

<style scoped>
.layout-measure-tree {
  width: 100%;
}
</style>
