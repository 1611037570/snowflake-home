import { getRegionContentHeight, getRegionPaddingHeight } from "./flowHeights";
import type { FlowHeightPlan } from "../paginate/flowHeights";
import type { RegionConfig } from "../pageLayoutTypes";

/** 区域内某个栏在生成分页流之前可以拿到的每页可用高度 */
export interface ColumnFlowPlan {
  /** 栏编号 */
  columnId: string;
  /** 每页可用高度：首页扣掉前面区域占用的高度，后续页面只扣本区域内容内边距 */
  heights: FlowHeightPlan;
}

/** 按栏生成分页流的回调：区域循环只负责给出每页可用高度 */
export type RegionFlowBuilder = <TPage>(
  column: RegionConfig["columns"][number],
  plan: ColumnFlowPlan,
) => TPage[];

/** 区域分页流构建参数 */
export interface BuildRegionFlowsOptions {
  /** 整页可用高度 */
  availableHeight: number;
  /** 区域之间的垂直间距 */
  regionGap: number;
  /** 按栏生成分页流 */
  buildFlow: RegionFlowBuilder;
}

/** 区域分页流构建结果 */
export interface RegionFlows<TPage> {
  /** 各栏的分页流，键为栏编号 */
  columnFlows: Map<string, TPage[]>;
}

/** 区域高度结算需要读取的页面信息 */
interface FlowPageLike {
  /** 当前页已经使用的高度 */
  usedHeight: number;
  /** 当前页中的内容条目 */
  items: unknown[];
}

/**
 * 计算每个区域、每个栏的分页流。
 * 区域按传入顺序结算，首个页面已被前面区域占用的高度在这里统一累计；
 * 分页算法只接收每页的可用高度，不再关心区域顺序、区域间距与内容内边距。
 */
export const buildRegionFlows = <TPage extends FlowPageLike>(
  orderedRegions: RegionConfig[],
  { availableHeight, regionGap, buildFlow }: BuildRegionFlowsOptions,
): RegionFlows<TPage> => {
  const columnFlows = new Map<string, TPage[]>();
  let firstPageConsumedHeight = 0;

  orderedRegions.forEach((region, regionIndex) => {
    const regionPaddingHeight = getRegionPaddingHeight(region);
    // 首页可用高度扣掉前面区域已经占用的部分，后续页面使用区域自身的完整可用高度
    const heights: FlowHeightPlan = {
      firstPageHeight: Math.max(
        0,
        availableHeight - firstPageConsumedHeight - regionPaddingHeight,
      ),
      laterPageHeight: Math.max(0, availableHeight - regionPaddingHeight),
    };

    const regionFlows = region.columns.map((column) =>
      buildFlow<TPage>(column, { columnId: column.id, heights }),
    );
    region.columns.forEach((column, index) => {
      columnFlows.set(column.id, regionFlows[index] ?? []);
    });

    // 自适应区域按首页实际占用结算；首页没有内容时区域内容内边距不计入占用
    if (region.height.mode === "auto") {
      const hasFirstPageContent = regionFlows.some(
        (flowPages) => (flowPages[0]?.items.length ?? 0) > 0,
      );
      const usedHeight = Math.max(
        ...regionFlows.map((flowPages) => flowPages[0]?.usedHeight || 0),
        0,
      );
      firstPageConsumedHeight += usedHeight + (hasFirstPageContent ? regionPaddingHeight : 0);
    } else {
      firstPageConsumedHeight += getRegionContentHeight(region, availableHeight);
    }

    if (regionIndex < orderedRegions.length - 1) {
      firstPageConsumedHeight += Math.max(0, regionGap);
    }
  });

  return { columnFlows };
};
