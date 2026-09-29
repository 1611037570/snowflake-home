<script setup lang="ts">
import { computed } from "vue";
import Item from "@/views/resume/theme/components/itemContainer.vue";
import { getItemFragmentStyle, isItemNode } from "../itemStyle";
import Title from "@/views/resume/theme/components/moduleTitle/index.vue";
import { useResumePreviewContext } from "../../../shared/previewContext";
import LayoutNodeContent from "../layoutNodeContent.vue";
import UserModule from "@/views/resume/theme/components/userContainer.vue";
import type { LayoutNode } from "../../engine/types";

const props = defineProps<{ node: LayoutNode }>();
const { theme } = useResumePreviewContext();
const itemConfig = computed(() => theme.itemStyle.value || {});
// 测量树复用同一条目样式，确保测量尺寸与实际预览一致。
const useItem = computed(() => isItemNode(props.node));
const isUserModule = computed(
  () => props.node.type === "group" && props.node.sourceModuleKey === "user",
);
const fullItemStyle = computed(() =>
  getItemFragmentStyle(
    { start: 0, end: Number.MAX_SAFE_INTEGER },
    undefined,
    "full",
    itemConfig.value.radius ?? "0",
  ),
);
const getBreakpointItemStyle = (offset: number) =>
  getItemFragmentStyle(
    { start: 0, end: Number.MAX_SAFE_INTEGER },
    { start: 0, end: offset },
    "top",
    itemConfig.value.radius ?? "0",
  );
</script>

<template>
  <div class="layout-measure-record">
    <div v-if="node.title" class="layout-measure-title" :data-layout-node-id="node.title.id">
      <Title :module-key="node.title.sourceModuleKey" />
    </div>
    <div class="layout-measure-node" :data-layout-node-id="node.id">
      <Item
        v-if="useItem"
        :item="itemConfig"
        :style="fullItemStyle"
        data-layout-block-range
      >
        <LayoutNodeContent :node="node" />
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
          :item="itemConfig"
          :style="getBreakpointItemStyle(point.offset)"
          data-layout-block-range
        >
          <LayoutNodeContent
            :node="node"
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
