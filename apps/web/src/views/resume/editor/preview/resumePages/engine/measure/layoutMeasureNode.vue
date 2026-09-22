<script setup lang="ts">
import Title from "../../../components/title/index.vue";
import LayoutNodeContent from "../render/layoutNodeContent.vue";
import type { LayoutNode } from "../types";

defineProps<{ node: LayoutNode }>();
</script>

<template>
  <div class="layout-measure-record">
    <div v-if="node.title" class="layout-measure-title" :data-layout-node-id="node.title.id">
      <Title :module-key="node.title.sourceModuleKey" />
    </div>
    <div class="layout-measure-node" :data-layout-node-id="node.id">
      <LayoutNodeContent :node="node" />
      <!-- 断点探针按首段内容样式渲染，量出的高度与真实首段一致（含容器外边距与上内边距） -->
      <div
        v-for="point in node.breakPoints"
        :key="point.offset"
        class="layout-measure-breakpoint"
        :data-layout-breakpoint-offset="point.offset"
        :style="{ width: '100%' }"
      >
        <LayoutNodeContent
          :node="node"
          :decoration="'top'"
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
