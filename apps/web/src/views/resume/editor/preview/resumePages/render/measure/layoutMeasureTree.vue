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
  /** 页面四周留白：作为正文容器的外边距内缩，与真实页面位置一致且不改变测量宽度 */
  pagePadding?: { top: number; right: number; bottom: number; left: number };
  showPageNumber?: boolean;
  footerText?: string;
  onMeasureEl?: (element: HTMLElement | null) => void;
}>();

/** 正文容器样式：内边距由页面几何预留，这里只负责底板、圆角、文字色与外边距内缩 */
const resolveViewStyle = (
  viewStyle?: { background: string; radius: number; color: string },
  pagePadding?: { top: number; right: number; bottom: number; left: number },
) => ({
  backgroundColor: viewStyle?.background ?? "transparent",
  borderRadius: `${viewStyle?.radius ?? 0}px`,
  color: viewStyle?.color ?? "inherit",
  marginTop: `${pagePadding?.top ?? 0}px`,
  marginRight: `${pagePadding?.right ?? 0}px`,
  marginBottom: `${pagePadding?.bottom ?? 0}px`,
  marginLeft: `${pagePadding?.left ?? 0}px`,
});
</script>

<template>
  <LayoutMeasureHost :width="width" :root-style="rootStyle" :class-name="rootClass" :on-measure-el="onMeasureEl">
    <!-- 与真实页面共用同一个正文容器外观：外边距与页面留白一致，容器本身不再叠加内边距 -->
    <div
      class="resume-view-container box-border w-auto flex-1"
      :style="resolveViewStyle(viewStyle, pagePadding)"
    >
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
