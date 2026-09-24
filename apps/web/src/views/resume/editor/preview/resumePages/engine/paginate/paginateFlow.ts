import type { MeasuredNode } from "../measure/types";
import type { LayoutNode } from "../types";

/** 分片在当前节点中的连续位置；title 表示标题单独留在当前页的分片 */
export type FlowFragmentKind = "single" | "first" | "middle" | "last" | "title";

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
  /** 当前分片覆盖的块区间，缺省表示全部块 */
  blockRange?: {
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
  /** 当前页实际使用的可用高度 */
  availableHeight?: number;
  /** 当前页中的节点 */
  items: FlowPageItem[];
  /** 落在页尾的模块间距：下一个模块换页时，本页剩余空间仍能容纳的间距 */
  trailingGap?: number;
}

/** 单栏分页的输入参数 */
export interface PaginateFlowOptions {
  /** 按顺序排列的排版节点 */
  nodes: LayoutNode[];
  /** 节点测量结果，分页引擎不直接读取 DOM */
  measurements: ReadonlyMap<string, MeasuredNode>;
  /** 当前栏可用高度 */
  availableHeight: number;
  /** 按页提供可用高度，未提供时所有页面使用 availableHeight。 */
  availableHeightByPage?: (pageIndex: number) => number;
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

/**
 * 页内高度容差：测量高度与渲染高度之间允许的亚像素舍入差。
 * 当前为 0：先靠算法把高度算准，容差仅保留能力，不再兜底
 */
const PAGE_HEIGHT_TOLERANCE = 0;

/** 查找当前剩余高度可以容纳的最大语义断点；高度相同时取偏移更靠后的断点，避免分片落在行中间 */
const findBestBreakPoint = (
  measurement: MeasuredNode,
  startHeight: number,
  droppedTopSpacing: number,
  availableHeight: number,
  dropBlockMargin: boolean,
) => {
  let bestBreakPoint: (typeof measurement.breakPoints)[number] | undefined;
  let bestHeight = 0;
  for (const point of measurement.breakPoints) {
    // 页面首位的续段不绘制该块上外边距，计价同步扣除
    const blockMargin = dropBlockMargin ? (point.leadingMargin ?? 0) : 0;
    const height =
      point.height - startHeight - (startHeight > 0 ? droppedTopSpacing : 0) - blockMargin;
    if (height <= 0 || height > availableHeight + PAGE_HEIGHT_TOLERANCE) continue;
    // 同一行内的多个断点高度相同，取最靠后的偏移让首片段尽量填满整行
    const isBetter =
      height > bestHeight || (height === bestHeight && point.offset > (bestBreakPoint?.offset ?? -1));
    if (isBetter) {
      bestBreakPoint = point;
      bestHeight = height;
    }
  }
  return bestBreakPoint;
};

/** 查找当前偏移之后的第一个断点，用于空页强制推进内容 */
const findNextBreakPoint = (
  measurement: MeasuredNode,
  startHeight: number,
  droppedTopSpacing: number,
  dropBlockMargin: boolean,
) => {
  let nextBreakPoint: (typeof measurement.breakPoints)[number] | undefined;
  let nextHeight = Number.POSITIVE_INFINITY;
  for (const point of measurement.breakPoints) {
    const blockMargin = dropBlockMargin ? (point.leadingMargin ?? 0) : 0;
    const height =
      point.height - startHeight - (startHeight > 0 ? droppedTopSpacing : 0) - blockMargin;
    if (height > 0 && height < nextHeight) {
      nextBreakPoint = point;
      nextHeight = height;
    }
  }
  return nextBreakPoint;
};

/**
 * 按节点顺序进行单栏贪心分页，所有节点都按测量断点参与分页。
 */
export const paginateFlow = ({
  nodes,
  measurements,
  availableHeight,
  availableHeightByPage,
  gap,
}: PaginateFlowOptions): FlowPage[] => {
  const safeAvailableHeight = Math.max(0, availableHeight);
  const safeGap = Number.isFinite(gap) ? Math.max(0, gap) : 0;
  const pages: FlowPage[] = [];
  let currentPage: FlowPage = {
    pageIndex: 0,
    usedHeight: 0,
    availableHeight: Math.max(0, availableHeightByPage?.(0) ?? safeAvailableHeight),
    items: [],
  };
  const getCurrentAvailableHeight = () =>
    Math.max(0, availableHeightByPage?.(currentPage.pageIndex) ?? safeAvailableHeight);
  const getGapBeforeItem = (sourceModuleKey: string, isContinuation: boolean) => {
    const previousItem = currentPage.items[currentPage.items.length - 1];
    return previousItem && !isContinuation && previousItem.sourceModuleKey !== sourceModuleKey
      ? safeGap
      : 0;
  };

  /** 换页前把模块间距留在上一页页尾：下一个模块换页时这段间距不应凭空消失 */
  const pushPage = (nextModuleKey?: string) => {
    if (currentPage.items.length > 0) {
      const lastItem = currentPage.items[currentPage.items.length - 1];
      const isModuleBoundary = Boolean(nextModuleKey) && lastItem.sourceModuleKey !== nextModuleKey;
      if (isModuleBoundary && currentPage.usedHeight + safeGap <= getCurrentAvailableHeight()) {
        currentPage.trailingGap = safeGap;
        currentPage.usedHeight += safeGap;
      }
      pages.push(currentPage);
    }
    const nextPageIndex = pages.length;
    currentPage = {
      pageIndex: nextPageIndex,
      usedHeight: 0,
      availableHeight: Math.max(0, availableHeightByPage?.(nextPageIndex) ?? safeAvailableHeight),
      items: [],
    };
  };

  /** 尝试把一个分片放入当前页，当前页已有内容且放不下时返回 false */
  const tryAddItem = (item: FlowPageItem, isContinuation: boolean): boolean => {
    const itemGap = getGapBeforeItem(item.sourceModuleKey, isContinuation);
    if (
      currentPage.items.length > 0 &&
      currentPage.usedHeight + itemGap + item.height >
        getCurrentAvailableHeight() + PAGE_HEIGHT_TOLERANCE
    ) {
      return false;
    }

    currentPage.items.push(item);
    currentPage.usedHeight += itemGap + item.height;
    return true;
  };

  for (const node of nodes) {
    const measurement = getMeasurement(node, measurements);
    const titleHeight = getTitleHeight(node, measurements);
    const fullHeight = Math.max(0, measurement.fullHeight);
    const contentEnd = getContentEnd(measurement);
    /** 节点渲染块总数：块区间以此为界，块序由渲染结构决定 */
    const blockCount = measurement.breakPoints.reduce(
      (max, point) => Math.max(max, point.blockEnd ?? 0),
      0,
    );
    let consumedHeight = 0;
    let consumedOffset = 0;
    let consumedBlocks = 0;
    // 标题已经单独留在当前页后，正文分片不再重复携带标题
    let titlePlaced = false;
    // 续段渲染会去掉内容容器上内边距，分页高度按同一口径扣减，避免高估续段占用
    const droppedTopSpacing = measurement.droppedTopSpacing ?? 0;

    while (consumedHeight < fullHeight || (fullHeight === 0 && consumedHeight === 0)) {
      const isFirst = consumedHeight === 0;
      const remainingHeight = Math.max(0, fullHeight - consumedHeight);
      // 顶部留白只在续段位于页首、且内容盒首块已由前面分片渲染过时才真正被移除：
      // 只放间距的分片不渲染内容盒，此时续段仍是完整的盒顶，不能扣除
      const activeDroppedTopSpacing =
        !isFirst && currentPage.items.length === 0 && (consumedBlocks > 0 || consumedOffset > 0)
          ? droppedTopSpacing
          : 0;
      // 标题也是独立行，和间距占位一样没有绑定：能放本页就放，放不下顺延下一页
      const withTitle = isFirst && !titlePlaced;
      const title = withTitle ? titleHeight : 0;
      // 独立间距行位于后续页面首位时不占空间，与渲染层隐藏规则一致。
      const hideLeadingSpacer =
        isFirst &&
        node.hideWhenPageLeading &&
        currentPage.pageIndex > 0 &&
        currentPage.items.length === 0;
      const hiddenSpacerHeight = hideLeadingSpacer ? fullHeight : 0;
      // 续段的装饰是 middle/last，渲染层不绘制它所在块的上外边距（无论是否在页首），计价同步扣除
      const dropBlockMargin = !isFirst;
      const nextBlockMargin = dropBlockMargin
        ? (measurement.breakPoints.find(
            (point) => point.blockEnd !== undefined && point.height > consumedHeight,
          )?.leadingMargin ?? 0)
        : 0;
      const wholeFragmentHeight =
        title + remainingHeight - hiddenSpacerHeight - nextBlockMargin;
      const wholeFragmentKind: FlowFragmentKind = isFirst ? "single" : "last";
      const wholeFragment: FlowPageItem = {
        fragmentId: `${node.id}:${wholeFragmentKind}:${consumedOffset}:${contentEnd}`,
        nodeId: node.id,
        sourceModuleKey: node.sourceModuleKey,
        titleNodeId: withTitle ? node.title?.id : undefined,
        fragment: wholeFragmentKind,
        height: Math.max(0, wholeFragmentHeight - activeDroppedTopSpacing),
        payload: node.payload,
        titlePayload: withTitle ? node.title?.payload : undefined,
        contentRange: contentEnd ? { start: consumedOffset, end: contentEnd } : undefined,
        blockRange: blockCount ? { start: consumedBlocks, end: blockCount } : undefined,
      };

      const wholeFragmentGap = getGapBeforeItem(node.sourceModuleKey, !isFirst);
      const wholeFragmentFits =
        currentPage.items.length === 0
          ? wholeFragment.height <= getCurrentAvailableHeight() + PAGE_HEIGHT_TOLERANCE
          : currentPage.usedHeight + wholeFragmentGap + wholeFragment.height <=
            getCurrentAvailableHeight() + PAGE_HEIGHT_TOLERANCE;
      if (wholeFragmentFits && tryAddItem(wholeFragment, !isFirst)) break;

      /** 标题放得下就留在当前页，正文顺延到下一页 */
      const placeTitle = () => {
        if (!withTitle || !node.title || currentPage.items.length === 0) return false;
        if (
          currentPage.usedHeight + getGapBeforeItem(node.sourceModuleKey, false) + titleHeight >
          getCurrentAvailableHeight()
        ) {
          return false;
        }
        const titleItem: FlowPageItem = {
          fragmentId: `${node.id}:title:${node.title.id}`,
          nodeId: node.id,
          sourceModuleKey: node.sourceModuleKey,
          titleNodeId: node.title.id,
          fragment: "title",
          height: titleHeight,
          payload: node.payload,
          titlePayload: node.title.payload,
        };
        if (!tryAddItem(titleItem, false)) return false;
        titlePlaced = true;
        return true;
      };

      const nodeGap = getGapBeforeItem(node.sourceModuleKey, !isFirst);
      const availableForContent = Math.max(
        0,
        getCurrentAvailableHeight() - currentPage.usedHeight - nodeGap - title,
      );
      const breakPoint =
        findBestBreakPoint(
          measurement,
          consumedHeight,
          activeDroppedTopSpacing,
          availableForContent,
          dropBlockMargin,
        ) ||
        (currentPage.items.length === 0
          ? findNextBreakPoint(
              measurement,
              consumedHeight,
              activeDroppedTopSpacing,
              dropBlockMargin,
            )
          : undefined);

      if (!breakPoint) {
        if (currentPage.items.length > 0) {
          if (placeTitle()) continue;
          pushPage(node.sourceModuleKey);
          continue;
        }
        // 没有可继续拆分的断点时，空页允许放入当前分片，避免分页循环无法结束。
        tryAddItem(wholeFragment, !isFirst);
        break;
      }

      const fragmentKind: FlowFragmentKind = isFirst ? "first" : "middle";
      const fragmentHeight =
        title +
        Math.max(0, breakPoint.height - consumedHeight) -
        activeDroppedTopSpacing -
        (dropBlockMargin ? (breakPoint.leadingMargin ?? 0) : 0);
      // 块断点只覆盖块（不含正文区间），字符断点覆盖剩余全部块 + 正文区间
      const isBlockPoint = typeof breakPoint.blockEnd === "number";
      const nextBlocks = isBlockPoint ? Number(breakPoint.blockEnd) : blockCount;
      const consumedBlockEnd =
        isBlockPoint || breakPoint.offset >= contentEnd
          ? nextBlocks
          : Math.max(consumedBlocks, blockCount - 1);
      const fragment: FlowPageItem = {
        fragmentId: `${node.id}:${fragmentKind}:${consumedOffset}:${breakPoint.offset}`,
        nodeId: node.id,
        sourceModuleKey: node.sourceModuleKey,
        titleNodeId: isFirst && !titlePlaced ? node.title?.id : undefined,
        fragment: fragmentKind,
        height: fragmentHeight,
        payload: node.payload,
        titlePayload: isFirst && !titlePlaced ? node.title?.payload : undefined,
        contentRange: isBlockPoint ? undefined : { start: consumedOffset, end: breakPoint.offset },
        blockRange: blockCount ? { start: consumedBlocks, end: nextBlocks } : undefined,
      };

      if (!tryAddItem(fragment, !isFirst)) {
        pushPage();
        continue;
      }

      consumedHeight = breakPoint.height;
      consumedBlocks = consumedBlockEnd;
      if (!isBlockPoint) consumedOffset = breakPoint.offset;
      // 块与正文都已切到末尾时结束，避免产生高度不为零但内容为空的尾分片
      if (consumedOffset >= contentEnd && consumedBlocks >= blockCount) break;
    }
  }

  if (currentPage.items.length > 0) pages.push(currentPage);
  return pages;
};
