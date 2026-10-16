<script setup lang="ts">
import { computed } from "vue";
import ModuleFrame from "../moduleFrame.vue";
import LayoutMeasureNode from "./layoutMeasureNode.vue";
import type { LayoutNode } from "../../engine/types";

const props = defineProps<{
  nodes: LayoutNode[]; // 当前栏的通用节点。
  gap: number; // 相邻模块之间的布局间距。
  probeNodeIds: ReadonlySet<string>; // 需要正文断点探针的节点编号。
}>();
// 连续同源节点与预览保持相同模块分组及标题槽位。
const groups = computed(() => {
  const result: Array<{ key: string /* 分组编号 */, moduleKey: string /* 来源模块 */, nodes: LayoutNode[] /* 分组节点 */ }> = [];
  for (const node of props.nodes) {
    const last = result[result.length - 1];
    if (last?.moduleKey === node.sourceModuleKey) last.nodes.push(node);
    else result.push({ key: node.id, moduleKey: node.sourceModuleKey, nodes: [node] });
  }
  return result;
});
</script>

<template>
  <div data-resume-column-content class="resume-column flex min-w-0 flex-1 flex-col">
    <template v-for="(group, index) in groups" :key="group.key">
      <div v-if="index > 0 && gap > 0" class="shrink-0" :style="{ height: `${gap}px` }" />
      <ModuleFrame :module-key="group.moduleKey">
        <template #title>
          <LayoutMeasureNode v-for="node in group.nodes.filter(node => node.type === 'title')" :key="node.id" :node="node" :enable-probes="probeNodeIds.has(node.id)" />
        </template>
        <LayoutMeasureNode v-for="node in group.nodes.filter(node => node.type !== 'title')" :key="node.id" :node="node" :enable-probes="probeNodeIds.has(node.id)" />
      </ModuleFrame>
    </template>
  </div>
</template>
