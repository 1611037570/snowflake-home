<script setup lang="ts">
import { computed } from "vue";
import LayoutMeasureHost from "./layoutMeasureHost.vue";
import LayoutMeasureNode from "./layoutMeasureNode.vue";
import RegionContainer from "@/views/resume/theme/components/regionContainer/index.vue";
import PagePattern from "@/views/resume/theme/components/pageContainer/index.vue";
import { getContentHeight, PAGE_NUMBER_HEIGHT } from "../../../shared/constants";
import type { LayoutNode } from "../../engine/types";

const props = defineProps<{
  /** 测量宿主宽度，等于页面内容宽度 */
  width: number;
  /** 按栏位分组的节点：每个分组按自己的栏宽渲染，保证测量宽度与真实排版一致 */
  groups: Array<{ id: string; width: number; nodes: LayoutNode[]; regionId?: string }>;
  /** 首页是否有独立标语区域；与分页和实际页面共用同一来源 */
  hasSlogan?: boolean;
  rootStyle?: Record<string, string>;
  rootClass?: string;
  /** 页面四周留白：作为测量内容的外边距内缩，与真实页面位置一致且不改变测量宽度 */
  pagePadding?: { top: number; right: number; bottom: number; left: number };
  /** 纸张边框宽度：真实页面把边框画在页面盒子内圈，测量宿主同样内缩这么多 */
  pageBorderWidth?: number;
  /** 正文区域是否绘制底板：绘制时正文区域需要拉满页面高度 */
  hasViewSurface?: boolean;
  showPageNumber?: boolean;
  footerText?: string;
  onMeasureEl?: (element: HTMLElement | null) => void;
}>();

// 标语从纸张顶端测量，后续区域各自保留左右留白。
const insetStyle = computed(() => {
  const inset = (value?: number) => `${(value ?? 0) + (props.pageBorderWidth ?? 0)}px`;
  return {
    marginTop: inset(props.hasSlogan ? 0 : props.pagePadding?.top),
    marginRight: inset(props.hasSlogan ? 0 : props.pagePadding?.right),
    marginBottom: inset(props.pagePadding?.bottom),
    marginLeft: inset(props.hasSlogan ? 0 : props.pagePadding?.left),
  };
});

// 正文区域底板的最小高度：长图导出时底板要铺满整页，与真实页面的正文高度同源
const mainRegionMinHeight = computed(() =>
  getContentHeight(
    props.pagePadding?.top ?? 0,
    props.showPageNumber === true,
    props.pageBorderWidth,
  ),
);

// 区域外观只给绘制底板的正文区域设置最小高度，其余区域按内容高度排版
const regionStyle = (regionId: string) => ({
  ...(regionId === "main" && props.hasViewSurface
    ? { minHeight: `${mainRegionMinHeight.value}px` }
    : {}),
  ...(props.hasSlogan && regionId !== "slogan"
    ? {
        width: "auto",
        marginLeft: `${props.pagePadding?.left ?? 0}px`,
        marginRight: `${props.pagePadding?.right ?? 0}px`,
      }
    : {}),
});

// 按区域归并栏位：同一区域的多个栏位共用一份区域外观，区域留白只作用一次
const regions = computed(() => {
  const grouped: Array<{ regionId: string; groups: typeof props.groups }> = [];
  props.groups.forEach((group) => {
    const regionId = group.regionId || "main";
    const existed = grouped.find((item) => item.regionId === regionId);
    if (existed) existed.groups.push(group);
    else grouped.push({ regionId, groups: [group] });
  });
  return grouped;
});
</script>

<template>
  <LayoutMeasureHost
    :width="width"
    :root-style="rootStyle"
    :class-name="rootClass"
    :on-measure-el="onMeasureEl"
  >
    <!-- 背景纹理由页面纹理组件绘制，与分页预览共用同一份实现 -->
    <PagePattern />
    <!-- 外层只负责页面内缩：区域纵向排列并各自铺满，栏位并排由区域容器负责 -->
    <div class="box-border flex w-auto flex-1 flex-col" :style="insetStyle">
      <RegionContainer
        v-for="region in regions"
        :key="region.regionId"
        :region-id="region.regionId"
        class="flex w-full min-w-0"
        :style="regionStyle(region.regionId)"
      >
        <div
          v-for="group in region.groups"
          :key="group.id"
          class="flex shrink-0 flex-col"
          :style="{ width: `${group.width}px` }"
        >
          <LayoutMeasureNode v-for="node in group.nodes" :key="node.id" :node="node" />
        </div>
      </RegionContainer>
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
