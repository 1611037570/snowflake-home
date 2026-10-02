<script setup lang="ts">
import { computed } from "vue";
import Item from "@/views/resume/theme/components/itemContainer/index.vue";
import { isItemNode } from "../itemStyle";
import LayoutNodeContent from "../layoutNodeContent.vue";
import UserModule from "@/views/resume/theme/components/userContainer/index.vue";
import type { LayoutNode } from "../../engine/types";

const props = defineProps<{ node: LayoutNode }>();
// 测量树复用同一条目外观组件，圆角与留白由外观自己声明，确保测量尺寸与实际预览一致。
const useItem = computed(() => isItemNode(props.node));
const isUserModule = computed(
  () => props.node.type === "group" && props.node.sourceModuleKey === "user",
);
/** 完整节点覆盖全部块，不裁剪任何圆角与留白 */
const FULL_BLOCK_RANGE = { start: 0, end: Number.MAX_SAFE_INTEGER };
</script>

<template>
  <div class="layout-measure-record">
    <div class="layout-measure-node" :data-layout-node-id="node.id">
      <Item
        v-if="useItem"
        :block-range="FULL_BLOCK_RANGE"
        :decoration="'full'"
        :node-type="node.type"
        data-layout-block-range
        v-slot="{ dateRail }"
      >
        <LayoutNodeContent :node="node" :date-rail="dateRail" />
      </Item>
      <UserModule v-else-if="isUserModule">
        <LayoutNodeContent :node="node" />
      </UserModule>
      <LayoutNodeContent v-else :node="node" />
      <!-- 断点探针按首段内容样式渲染，量出的高度与真实首段一致（含容器外边距与上内边距） -->
      <div
        v-for="point in node.breakPoints"
        :key="point.offset"
        class="layout-measure-breakpoint"
        :data-layout-breakpoint-offset="point.offset"
        :style="{ width: '100%' }"
      >
        <Item
          v-if="useItem"
          :block-range="FULL_BLOCK_RANGE"
          :content-range="{ start: 0, end: point.offset }"
          :decoration="'top'"
          :node-type="node.type"
          data-layout-block-range
          v-slot="{ dateRail }"
        >
          <LayoutNodeContent
            :node="node"
            :date-rail="dateRail"
            :decoration="'top'"
            :content-range="{ start: 0, end: point.offset }"
          />
        </Item>
        <UserModule v-else-if="isUserModule">
          <LayoutNodeContent
            :node="node"
            :decoration="'top'"
            :content-range="{ start: 0, end: point.offset }"
          />
        </UserModule>
        <LayoutNodeContent
          v-else
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
