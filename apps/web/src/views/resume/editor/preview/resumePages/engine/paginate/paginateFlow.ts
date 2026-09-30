import { resolveFragmentCut } from "./cutPoints";
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
  /** 当前分片在节点中的位置 */
  fragment: FlowFragmentKind;
  /** 当前分片占用的高度 */
  height: number;
  /** 当前分片对应的节点内容 */
  payload: unknown;
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

/** 读取节点内容的最后一个可用偏移量 */
const getContentEnd = (measurement: MeasuredNode): number =>
  measurement.breakPoints[measurement.breakPoints.length - 1]?.offset ?? 0;

/**
 * 页内高度容差：测量高度与渲染高度之间允许的亚像素舍入差。
 * 当前为 0：先靠算法把高度算准，容差仅保留能力，不再兜底
 */
const PAGE_HEIGHT_TOLERANCE = 0;

/**
 * 同一节点连续换页且始终放不下内容的次数上限。
 * 内容放不下时换页是正常推进，但换页必须最终带来消费；超过上限说明测量结果无法承载该节点，
 * 继续换页只会产生空页，这里直接结束节点，作为循环收敛的硬保证。
 */
const MAX_PAGE_TURNS_WITHOUT_PROGRESS = 3;

/**
 * 切割点必须覆盖内容才能产生分片。
 * 块结束序号为 0 的块断点只覆盖间距、不覆盖任何块：在它上面切分只会得到没有内容的片段，
 * 而整片路径又会把这段间距重复计入高度，因此这类断点不作为切割点。
 */
const coversContent = (point: MeasuredNode["breakPoints"][number]): boolean =>
  point.blockEnd === undefined || point.blockEnd > 0;

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
    if (!coversContent(point)) continue;
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
    if (!coversContent(point)) continue;
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
    // 续段渲染会去掉内容容器上内边距，分页高度按同一口径扣减，避免高估续段占用
    const droppedTopSpacing = measurement.droppedTopSpacing ?? 0;
    // 两层推进：外层换页，内层填满当前页；本轮是否消费内容由消费量是否前进表示
    let pageTurnsWithoutProgress = 0;
    while (consumedHeight < fullHeight || (fullHeight === 0 && consumedHeight === 0)) {
      const pageStartHeight = consumedHeight;
      const startItemCount = currentPage.items.length;
      const startPageIndex = currentPage.pageIndex;
      // 内层反复尝试放置，直到本轮消费了内容；换页与节点结束都在这里退出，由外层决定是否继续
      while (
        consumedHeight === pageStartHeight &&
        currentPage.pageIndex === startPageIndex &&
        currentPage.items.length >= startItemCount
      ) {
        const isFirst = consumedHeight === 0;
        const remainingHeight = Math.max(0, fullHeight - consumedHeight);
        // 顶部留白只在续段位于页首、且内容盒首块已由前面分片渲染过时才真正被移除：
        // 只放间距的分片不渲染内容盒，此时续段仍是完整的盒顶，不能扣除
        const activeDroppedTopSpacing =
          !isFirst && currentPage.items.length === 0 && (consumedBlocks > 0 || consumedOffset > 0)
            ? droppedTopSpacing
            : 0;
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
        const wholeFragmentHeight = remainingHeight - hiddenSpacerHeight - nextBlockMargin;
        const wholeFragmentKind: FlowFragmentKind = isFirst ? "single" : "last";
        const wholeFragment: FlowPageItem = {
          fragmentId: `${node.id}:${wholeFragmentKind}:${consumedOffset}:${contentEnd}`,
          nodeId: node.id,
          sourceModuleKey: node.sourceModuleKey,
          fragment: wholeFragmentKind,
          height: Math.max(0, wholeFragmentHeight - activeDroppedTopSpacing),
          payload: node.payload,
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

        const nodeGap = getGapBeforeItem(node.sourceModuleKey, !isFirst);
        const availableForContent = Math.max(
          0,
          getCurrentAvailableHeight() - currentPage.usedHeight - nodeGap,
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
            pushPage(node.sourceModuleKey);
            continue;
          }
          // 没有可继续拆分的断点时，空页允许放入当前分片，避免分页循环无法结束。
          tryAddItem(wholeFragment, !isFirst);
          break;
        }

        const fragmentKind: FlowFragmentKind = isFirst ? "first" : "middle";
        const fragmentHeight =
          Math.max(0, breakPoint.height - consumedHeight) -
          activeDroppedTopSpacing -
          (dropBlockMargin ? (breakPoint.leadingMargin ?? 0) : 0);
        // 切割点覆盖范围由纯规则解析：块断点只覆盖块，文本断点覆盖剩余全部块与正文
        const cut = resolveFragmentCut({
          breakPoint,
          blockCount,
          contentEnd,
          consumedBlockCount: consumedBlocks,
          consumedOffset,
        });
        const { isBlockPoint, consumedBlockEnd } = cut;
        const fragment: FlowPageItem = {
          fragmentId: `${node.id}:${fragmentKind}:${consumedOffset}:${breakPoint.offset}`,
          nodeId: node.id,
          sourceModuleKey: node.sourceModuleKey,
          fragment: fragmentKind,
          height: fragmentHeight,
          payload: node.payload,
          contentRange: cut.contentRange,
          blockRange: cut.blockRange,
        };

        if (!tryAddItem(fragment, !isFirst)) {
          pushPage();
          continue;
        }

        // 记下推进前的消费量：断点高度不高于已消费高度说明本片没有消费任何内容
        const fragmentHeightBefore = consumedHeight;
        consumedHeight = breakPoint.height;
        consumedBlocks = consumedBlockEnd;
        if (!isBlockPoint) consumedOffset = breakPoint.offset;
        // 零推进护栏：测量层会过滤零高度块，但块总数仍按块结束序号统计，两者不一致时，
        // 这次分片不会推进消费量，再循环一次会选出同一个断点并反复换页，这里直接结束当前节点
        if (consumedHeight <= fragmentHeightBefore) break;
        // 块与正文都已切到末尾时结束，避免产生高度不为零但内容为空的尾分片
        if (consumedOffset >= contentEnd && consumedBlocks >= blockCount) break;
      }
      // 本轮消费了内容就继续填当前页；只是换页也允许重试一次
      if (consumedHeight > pageStartHeight) {
        pageTurnsWithoutProgress = 0;
        continue;
      }
      if (currentPage.pageIndex === startPageIndex) break;
      // 允许换页重试，但不允许一直换页却始终放不下内容
      pageTurnsWithoutProgress += 1;
      if (pageTurnsWithoutProgress >= MAX_PAGE_TURNS_WITHOUT_PROGRESS) break;
    }
  }

  if (currentPage.items.length > 0) pages.push(currentPage);
  return pages;
};
