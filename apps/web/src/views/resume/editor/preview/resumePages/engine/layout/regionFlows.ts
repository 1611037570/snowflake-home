import type { RegionConfig } from "../pageLayoutTypes";

/** 区域高度循环读取的分页流页面：只依赖分页算法输出的已用高度与内容条目 */
export interface RegionFlowPage {
  /** 当前页已经使用的高度 */
  usedHeight: number;
  /** 当前页中的内容条目 */
  items: unknown[];
  /** 当前页实际使用的可用高度 */
  availableHeight?: number;
}

/** 按栏生成分页流的回调：区域循环把每页可用高度交给分页算法 */
export type RegionFlowBuilder = <TPage extends RegionFlowPage>(
  column: RegionConfig["columns"][number],
  flowOptions: {
    /** 当前栏首页可用高度 */
    availableHeight: number;
    /** 按页提供可用高度：首页之外的页面扣掉区域自身的内边距 */
    availableHeightByPage: (pageIndex: number) => number;
  },
) => TPage[];

/** 区域高度循环的输出 */
export interface RegionFlows<TPage extends RegionFlowPage> {
  /** 各栏的分页流，键为栏编号 */
  columnFlows: Map<string, TPage[]>;
  /** 第一个页面已被各区域占用的高度，供后续区域扣减首页可用高度 */
  firstPageConsumedHeight: number;
}

/**
 * 计算每个区域、每个栏的分页流，并累计首个页面已被占用掉的高度。
 * 区域按传入顺序结算，调用方必须已按 order 排序；区域高度模式、区域内容内边距
 * 与区域间距都在这里参与计算，分页算法只接收每页的可用高度。
 */
export const buildRegionFlows = <TPage extends RegionFlowPage>(
  orderedRegions: RegionConfig[],
  options: {
    /** 整页可用高度 */
    availableHeight: number;
    /** 区域之间的垂直间距 */
    regionGap: number;
    /** 按栏生成分页流 */
    buildFlow: RegionFlowBuilder;
  },
): RegionFlows<TPage> => {
  const { availableHeight, regionGap, buildFlow } = options;
  const columnFlows = new Map<string, TPage[]>();
  let firstPageConsumedHeight = 0;

  orderedRegions.forEach((region, regionIndex) => {
    // 区域上下内边距占用页面高度，各页内容高度统一从区域配置扣除。
    const regionPaddingHeight =
      (region.contentPadding?.top ?? 0) + (region.contentPadding?.bottom ?? 0);
    // 首页可用高度扣掉前面区域已经占用的部分，后续页面使用区域自身的完整可用高度
    const firstPageAvailableHeight = Math.max(
      0,
      availableHeight - firstPageConsumedHeight - regionPaddingHeight,
    );
    const regionFlows = region.columns.map((column) => {
      const flowPages = buildFlow<TPage>(column, {
        availableHeight: firstPageAvailableHeight,
        availableHeightByPage: (pageIndex) =>
          Math.max(
            0,
            pageIndex === 0 ? firstPageAvailableHeight : availableHeight - regionPaddingHeight,
          ),
      });
      columnFlows.set(column.id, flowPages);
      return flowPages;
    });

    const firstPageRegionHeight = Math.max(
      ...regionFlows.map((flowPages) => flowPages[0]?.usedHeight || 0),
      0,
    );
    if (region.height.mode === "auto") {
      const hasFirstPageContent = regionFlows.some(
        (flowPages) => (flowPages[0]?.items.length ?? 0) > 0,
      );
      firstPageConsumedHeight +=
        firstPageRegionHeight + (hasFirstPageContent ? regionPaddingHeight : 0);
    } else if (region.height.mode === "fixed") {
      firstPageConsumedHeight += region.height.value;
    } else {
      firstPageConsumedHeight = availableHeight;
    }

    if (regionIndex < orderedRegions.length - 1) {
      firstPageConsumedHeight += Math.max(0, regionGap);
    }
  });

  return { columnFlows, firstPageConsumedHeight };
};
