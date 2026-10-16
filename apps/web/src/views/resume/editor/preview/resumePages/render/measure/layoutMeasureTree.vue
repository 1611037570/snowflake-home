<script setup lang="ts">
import { computed } from "vue";
import LayoutMeasureHost from "./layoutMeasureHost.vue";
import LayoutMeasureModule from "./layoutMeasureModule.vue";
import ColumnBox from "../columnBox.vue";
import RegionContainer from "@/views/resume/theme/components/regionContainer/index.vue";
import PagePattern from "@/views/resume/theme/components/pageContainer/index.vue";
import PageDecoration from "@/views/resume/theme/components/pageDecoration/index.vue";
import PageFooter from "@/views/resume/theme/components/pageFooter/index.vue";
import type { FooterTemplateId } from "@/domain/resume/theme/uiTypes";
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
    gap?: number; // 与预览共用的栏内模块间距
  }>;
  /** 首页从纸张顶边开始的区域编号；与分页和实际页面共用同一来源 */
  topRegionId?: string | null;
  /** 布局结算后的区域几何，与预览读取同一份配置 */
  regionConfigs: RegionConfig[];
  rootStyle?: Record<string, string>;
  rootClass?: string;
  /** 页面四周留白：作为测量内容的外边距内缩，与真实页面位置一致且不改变测量宽度 */
  pagePadding?: { top: number; right: number; bottom: number; left: number };
  /** 纸张边框宽度：真实页面把边框画在页面盒子内圈，测量宿主同样内缩这么多 */
  pageBorderWidth?: number;
  showPageNumber?: boolean;
  footerText?: string;
  footerTemplate: FooterTemplateId; // 测量页尾使用的模板编号。
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

// 按布局区域归并栏位，区域外观和间距直接读取同一份配置。
const regions = computed(() => {
  const groupsByRegion = new Map<string, typeof props.groups>();
  props.groups.forEach((group) => {
    const regionId = group.regionId || "main";
    const groups = groupsByRegion.get(regionId);
    if (groups) groups.push(group);
    else groupsByRegion.set(regionId, [group]);
  });
  return props.regionConfigs.flatMap((region) => {
    const groups = groupsByRegion.get(region.id);
    return groups?.length ? [{ ...region, groups /* 当前区域的测量栏位。 */ }] : [];
  });
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
      <template v-for="(region, regionIndex) in regions" :key="region.id">
        <div v-if="regionIndex > 0 && region.gapBefore" class="shrink-0" :style="{ height: `${region.gapBefore}px` }" />
        <RegionContainer
          :region-id="region.id"
          :region-padding="region.padding"
          :column-gap="region.columnGap"
          :full-bleed="region.id === topRegionId"
          class="flex w-full min-w-0"
          :top-region-present="Boolean(topRegionId)"
          :width-mode="region.widthMode"
        >
          <ColumnBox
            v-for="group in region.groups"
            :key="group.id"
            :column-id="group.id"
            :width="group.width"
            :padding="group.padding"
          >
            <LayoutMeasureModule :nodes="group.nodes" :gap="group.gap ?? 0" />
          </ColumnBox>
        </RegionContainer>
      </template>
    </div>
    <div
      v-if="showPageNumber"
      class="flex flex-1 items-end justify-center py-3 text-xs opacity-50"
      :style="{ height: `${PAGE_NUMBER_HEIGHT}px` }"
    >
      <PageFooter :text="footerText || ''" :template-id="footerTemplate" />
    </div>
  </LayoutMeasureHost>
</template>

<style scoped>
.layout-measure-tree {
  width: 100%;
}
</style>
