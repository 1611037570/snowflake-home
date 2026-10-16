<script setup lang="ts">
import { computed } from "vue";
import NodeFragment from "../nodeFragment.vue";
import type { LayoutNode } from "../../engine/types";

const props = defineProps<{
  node: LayoutNode; // 待测量排版节点。
  enableProbes: boolean; // 分页确认需要正文断点时才挂载探针。
}>();
// 正文末尾直接使用完整节点高度；整块节点不消费内部断点，均无需复制探针内容。
const probePoints = computed(() => {
  if (!props.enableProbes || props.node.splitMode === "whole") return [];
  const points = props.node.breakPoints ?? [];
  const contentEnd = points.reduce((end, point) => Math.max(end, point.offset), 0);
  return points.filter((point) => contentEnd === 0 || point.offset !== contentEnd);
});
</script>

<template>
  <div class="layout-measure-record">
    <div class="layout-measure-node" :data-layout-node-id="node.id">
      <NodeFragment :node="node" measurement />
      <!-- 断点探针与完整节点共用相同外框和正文组件，只有字符区间不同。 -->
      <div
        v-for="point in probePoints"
        :key="point.offset"
        class="layout-measure-breakpoint"
        :data-layout-breakpoint-offset="point.offset"
        :style="{ width: '100%' }"
      >
        <NodeFragment
          :node="node"
          measurement
          decoration="top"
          :content-range="{ start: 0, end: point.offset }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout-measure-node {
  position: relative;
  width: 100%;
  /* 独立格式化上下文：让内容容器的上外边距计入节点高度，与真实首段渲染高度对齐 */
  display: flow-root;
}

.layout-measure-breakpoint {
  position: absolute;
  left: 0;
  top: 0;
  visibility: hidden;
  pointer-events: none;
}
</style>
