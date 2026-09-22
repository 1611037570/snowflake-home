import type { MeasuredNode } from "../measure/types";
import type { LayoutNode } from "../types";

/** 分片在当前节点中的连续位置 */
export type FlowFragmentKind = "single" | "first" | "middle" | "last";

/** 单栏页面中的节点分片 */
export interface FlowPageItem {
  /** 当前分片唯一编号 */
  fragmentId: string;
  /** 排版节点编号 */
  nodeId: string;
  /** 来源模块 key */
  sourceModuleKey: string;
  /** 首次出现时一并渲染的标题节点编号 */
  titleNodeId?: string;
  /** 当前分片在节点中的位置 */
  fragment: FlowFragmentKind;
  /** 当前分片占用的高度 */
  height: number;
  /** 当前分片对应的节点内容 */
  payload: unknown;
  /** 首次分片对应的标题内容 */
  titlePayload?: unknown;
  /** 当前分片对应的内容范围 */
  contentRange?: {
    start: number;
    end: number;
  };
}

/** 单栏分页结果 */
export interface FlowPage {
  /** 页码，从 0 开始 */
  pageIndex: number;
  /** 当前页已经使用的高度 */
  usedHeight: number;
  /** 当前页中的节点 */
  items: FlowPageItem[];
}

/** 单栏分页的输入参数 */
export interface PaginateFlowOptions {
  /** 按顺序排列的排版节点 */
  nodes: LayoutNode[];
  /** 节点测量结果，分页引擎不直接读取 DOM */
  measurements: ReadonlyMap<string, MeasuredNode>;
  /** 当前栏可用高度 */
  availableHeight: number;
  /** 不同节点之间的间距 */
  gap: number;
}

/** 读取节点测量结果，缺少测量数据时直接报告配置错误 */
const getMeasurement = (
  node: LayoutNode,
  measurements: ReadonlyMap<string, MeasuredNode>,
): MeasuredNode => {
  const measurement = measurements.get(node.id);
  if (!measurement) {
    throw new Error(`缺少排版节点测量结果：${node.id}`);
  }
  return measurement;
};

/** 读取节点标题高度；标题只参与节点第一次出现时的高度计算 */
const getTitleHeight = (
  node: LayoutNode,
  measurements: ReadonlyMap<string, MeasuredNode>,
): number => {
  if (!node.title) return 0;
  return Math.max(0, getMeasurement(node.title, measurements).fullHeight);
};

/** 读取节点内容的最后一个可用偏移量 */
const getContentEnd = (measurement: MeasuredNode): number =>
  measurement.breakPoints[measurement.breakPoints.length - 1]?.offset ?? 0;

/** 查找当前剩余高度可以容纳的最大语义断点 */
const findBestBreakPoint = (
  measurement: MeasuredNode,
  startHeight: number,
  availableHeight: number,
) => {
  const candidates = measurement.breakPoints.filter((point) => {
    const height = point.height - startHeight;
    return point.height > startHeight && height <= availableHeight;
  });
  return candidates[candidates.length - 1];
};

/** 查找当前偏移之后的第一个断点，用于空页强制推进内容 */
const findNextBreakPoint = (measurement: MeasuredNode, startHeight: number) =>
  measurement.breakPoints.find((point) => point.height > startHeight);

/**
 * 按节点顺序进行单栏贪心分页。
 * 可拆分节点优先使用测量结果中的语义断点，避免从任意位置截断内容。
 */
export const paginateFlow = ({
  nodes,
  measurements,
  availableHeight,
  gap,
}: PaginateFlowOptions): FlowPage[] => {
  const safeAvailableHeight = Math.max(0, availableHeight);
  const safeGap = Number.isFinite(gap) ? Math.max(0, gap) : 0;
  const pages: FlowPage[] = [];
  let currentPage: FlowPage = {
    pageIndex: 0,
    usedHeight: 0,
    items: [],
  };

  const pushPage = () => {
    if (currentPage.items.length > 0) pages.push(currentPage);
    currentPage = {
      pageIndex: pages.length,
      usedHeight: 0,
      items: [],
    };
  };

  /** 尝试把一个分片放入当前页，当前页已有内容且放不下时返回 false */
  const tryAddItem = (item: FlowPageItem, isContinuation: boolean): boolean => {
    const nodeGap = currentPage.items.length > 0 && !isContinuation ? safeGap : 0;
    if (
      currentPage.items.length > 0 &&
      currentPage.usedHeight + nodeGap + item.height > safeAvailableHeight
    ) {
      return false;
    }

    const pageGap = currentPage.items.length > 0 && !isContinuation ? safeGap : 0;
    currentPage.items.push(item);
    currentPage.usedHeight += pageGap + item.height;
    return true;
  };

  for (const node of nodes) {
    if (node.title && !node.breakPolicy.keepTitleWithFirst) {
      throw new Error(`带标题节点必须绑定首段内容：${node.id}`);
    }
    const measurement = getMeasurement(node, measurements);
    const titleHeight = getTitleHeight(node, measurements);
    const fullHeight = Math.max(0, measurement.fullHeight);
    const contentEnd = getContentEnd(measurement);
    const canSplit = node.breakPolicy.splittable && measurement.breakPoints.length > 0;
    let consumedHeight = 0;
    let consumedOffset = 0;

    while (consumedHeight < fullHeight || (fullHeight === 0 && consumedHeight === 0)) {
      const isFirst = consumedHeight === 0;
      const remainingHeight = Math.max(0, fullHeight - consumedHeight);
      const title = isFirst ? titleHeight : 0;
      const wholeFragmentHeight = title + remainingHeight;
      const wholeFragmentKind: FlowFragmentKind = isFirst
        ? "single"
        : "last";
      const wholeFragment: FlowPageItem = {
        fragmentId: `${node.id}:${wholeFragmentKind}:${consumedOffset}:${contentEnd}`,
        nodeId: node.id,
        sourceModuleKey: node.sourceModuleKey,
        titleNodeId: isFirst ? node.title?.id : undefined,
        fragment: wholeFragmentKind,
        height: wholeFragmentHeight,
        payload: node.payload,
        titlePayload: isFirst ? node.title?.payload : undefined,
        contentRange: contentEnd
          ? { start: consumedOffset, end: contentEnd }
          : undefined,
      };

      const wholeFragmentGap = currentPage.items.length > 0 && !isFirst ? 0 : safeGap;
      const wholeFragmentFits =
        currentPage.items.length === 0
          ? wholeFragmentHeight <= safeAvailableHeight
          : currentPage.usedHeight + wholeFragmentGap + wholeFragmentHeight <= safeAvailableHeight;
      if (wholeFragmentFits && tryAddItem(wholeFragment, !isFirst)) break;

      // 不可拆节点或没有可用断点时，当前页放不下就换页，空页则允许溢出。
      if (!canSplit) {
        if (currentPage.items.length > 0) {
          pushPage();
          continue;
        }
        tryAddItem(wholeFragment, !isFirst);
        break;
      }

      const nodeGap = currentPage.items.length > 0 && !isFirst ? safeGap : 0;
      const availableForContent = Math.max(
        0,
        safeAvailableHeight - currentPage.usedHeight - nodeGap - title,
      );
      const breakPoint =
        findBestBreakPoint(measurement, consumedHeight, availableForContent) ||
        (currentPage.items.length === 0
          ? findNextBreakPoint(measurement, consumedHeight)
          : undefined);

      if (!breakPoint) {
        if (currentPage.items.length > 0) {
          pushPage();
          continue;
        }
        // 没有可继续拆分的断点时，空页允许放入当前分片，避免分页循环无法结束。
        tryAddItem(wholeFragment, !isFirst);
        break;
      }

      const fragmentKind: FlowFragmentKind = isFirst ? "first" : "middle";
      const fragmentHeight = title + Math.max(0, breakPoint.height - consumedHeight);
      const fragment: FlowPageItem = {
        fragmentId: `${node.id}:${fragmentKind}:${consumedOffset}:${breakPoint.offset}`,
        nodeId: node.id,
        sourceModuleKey: node.sourceModuleKey,
        titleNodeId: isFirst ? node.title?.id : undefined,
        fragment: fragmentKind,
        height: fragmentHeight,
        payload: node.payload,
        titlePayload: isFirst ? node.title?.payload : undefined,
        contentRange: {
          start: consumedOffset,
          end: breakPoint.offset,
        },
      };

      if (!tryAddItem(fragment, !isFirst)) {
        pushPage();
        continue;
      }

      consumedHeight = breakPoint.height;
      consumedOffset = breakPoint.offset;
    }
  }

  if (currentPage.items.length > 0) pages.push(currentPage);
  return pages;
};
