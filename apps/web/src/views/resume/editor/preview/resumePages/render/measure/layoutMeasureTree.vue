<script setup lang="ts">
import { computed } from "vue";
import LayoutMeasureHost from "./layoutMeasureHost.vue";
import LayoutMeasureModule from "./layoutMeasureModule.vue";
import ColumnBox from "../columnBox.vue";
import RegionContainer from "@/views/resume/theme/components/regionContainer/index.vue";
import PagePattern from "@/views/resume/theme/components/pageContainer/index.vue";
import PageDecoration from "@/views/resume/theme/components/pageDecoration/index.vue";
import PageFooter from "@/views/resume/theme/components/pageFooter/index.vue";
import { PAGE_NUMBER_HEIGHT } from "../../../shared/constants";
import type { LayoutNode } from "../../engine/types";
import type { ColumnPadding, RegionConfig } from "../../engine/pageLayoutTypes";

const props = defineProps<{
  /** 测量宿主宽度，等于页面内容宽度 */
  width: number;
  /** 按栏位分组的节点：每个分组按自己的栏宽渲染，保证测量宽度与真实排版一致 */
  groups: Array<{
    id: string; // 栏编号
    width: number; // 栏外部宽度
    nodes: LayoutNode[]; // 待测量内容节点
    regionId?: string; // 所属区域编号
    padding?: ColumnPadding; // 与预览共用的栏装饰内边距
  }>;
  /** 首页从纸张顶边开始的区域编号；与分页和实际页面共用同一来源 */
  topRegionId?: string | null;
  /** 布局结算后的区域几何，与预览读取同一份配置 */
  regionConfigs: RegionConfig[];
  columnGap?: number; // 公共布局结算的栏间距
  rootStyle?: Record<string, string>;
  rootClass?: string;
  /** 页面四周留白：作为测量内容的外边距内缩，与真实页面位置一致且不改变测量宽度 */
  pagePadding?: { top: number; right: number; bottom: number; left: number };
  /** 纸张边框宽度：真实页面把边框画在页面盒子内圈，测量宿主同样内缩这么多 */
  pageBorderWidth?: number;
  showPageNumber?: boolean;
  footerText?: string;
  onMeasureEl?: (element: HTMLElement | null) => void;
}>();

// 标语从纸张顶端测量，后续区域各自保留左右留白。
const insetStyle = computed(() => {
  const inset = (value?: number) => `${(value ?? 0) + (props.pageBorderWidth ?? 0)}px`;
  return {
    marginTop: inset(props.topRegionId ? 0 : props.pagePadding?.top),
    marginRight: inset(props.topRegionId ? 0 : props.pagePadding?.right),
    marginBottom: inset(props.pagePadding?.bottom),
    marginLeft: inset(props.topRegionId ? 0 : props.pagePadding?.left),
  };
});

// 区域几何直接读取引擎配置，水平内缩由公共区域盒子施加。
const regionConfigMap = computed(() => new Map(props.regionConfigs.map((region) => [region.id, region])));

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
    <PageDecoration />
    <!-- 外层只负责页面内缩：区域纵向排列并各自铺满，栏位并排由区域容器负责 -->
    <div class="box-border flex w-auto flex-1 flex-col" :style="insetStyle">
      <RegionContainer
        v-for="region in regions"
        :key="region.regionId"
        :region-id="region.regionId"
        :region-padding="regionConfigMap.get(region.regionId)?.padding"
        :column-gap="columnGap"
        :full-bleed="region.regionId === topRegionId"
        class="flex w-full min-w-0"
        :top-region-present="Boolean(topRegionId)"
        :width-mode="regionConfigMap.get(region.regionId)?.widthMode"
      >
        <ColumnBox
          v-for="group in region.groups"
          :key="group.id"
          :column-id="group.id"
          :width="group.width"
          :padding="group.padding"
        >
          <LayoutMeasureModule :nodes="group.nodes" />
        </ColumnBox>
      </RegionContainer>
    </div>
    <div
      v-if="showPageNumber"
      class="flex flex-1 items-end justify-center py-3 text-xs opacity-50"
      :style="{ height: `${PAGE_NUMBER_HEIGHT}px` }"
    >
      <PageFooter :text="footerText || ''" />
    </div>
  </LayoutMeasureHost>
</template>

<style scoped>
.layout-measure-tree {
  width: 100%;
}
</style>
