<script setup lang="ts">
import LayoutMeasureHost from "./layoutMeasureHost.vue";
import LayoutMeasureNode from "./layoutMeasureNode.vue";
import { PAGE_NUMBER_HEIGHT } from "../../../shared/constants";
import type { LayoutNode } from "../../engine/types";

defineProps<{
  /** 测量宿主宽度，等于页面内容宽度 */
  width: number;
  /** 按栏位分组的节点：每个分组按自己的栏宽渲染，保证测量宽度与真实排版一致 */
  groups: Array<{ id: string; width: number; nodes: LayoutNode[] }>;
  rootStyle?: Record<string, string>;
  rootClass?: string;
  /** 正文容器外观：与真实页面同一份样式，长图导出才不会丢掉底板 */
  viewStyle?: { background: string; radius: number; color: string };
  showPageNumber?: boolean;
  footerText?: string;
  onMeasureEl?: (element: HTMLElement | null) => void;
}>();

/** 正文容器样式：内边距由页面几何预留，这里只负责底板、圆角与文字色 */
const resolveViewStyle = (viewStyle?: { background: string; radius: number; color: string }) => ({
  backgroundColor: viewStyle?.background ?? "transparent",
  borderRadius: `${viewStyle?.radius ?? 0}px`,
  color: viewStyle?.color ?? "inherit",
});
</script>

<template>
  <LayoutMeasureHost :width="width" :root-style="rootStyle" :class-name="rootClass" :on-measure-el="onMeasureEl">
    <!-- 与真实页面共用同一个正文容器外观：容器不设内边距，页面几何已经预留了正文容器内边距 -->
    <div class="resume-view-container box-border w-full" :style="resolveViewStyle(viewStyle)">
      <div
        v-for="group in groups"
        :key="group.id"
        class="flex flex-col"
        :style="{ width: `${group.width}px` }"
      >
        <LayoutMeasureNode v-for="node in group.nodes" :key="node.id" :node="node" />
      </div>
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
