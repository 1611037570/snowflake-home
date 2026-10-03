import { resolveFragmentCut } from "./cutPoints";
import {
  resolveCutHeight,
  resolveDroppedTopSpacing,
  resolveNextBlockMargin,
} from "./fragmentGeometry";
import { resolvePageHeight } from "./pageHeights";
import type { FlowHeightPlan } from "./pageHeights";
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
  /** 每页可用高度：首页会被前面区域占用扣减，后续页面相同 */
  heights: FlowHeightPlan;
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

/**
 * 读取节点内容的末尾偏移。
 * 优先使用测量层给出的正文真实长度；缺失时取断点偏移的最大值兜底。
 * 不能取断点序列的最后一项：块断点偏移恒为零，排在文本断点之后会把末尾低估成零，
 * 续段的起始偏移随之回退到零，同一段正文会被两页重复渲染。
 */
const getContentEnd = (measurement: MeasuredNode): number =>
  measurement.contentLength ??
  measurement.breakPoints.reduce((max, point) => Math.max(max, point.offset), 0);

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
    const height = resolveCutHeight({
      point,
      startHeight,
      // 首片与续段的留白口径不同：续段不绘制所在块的上外边距
      isFirstFragment: !dropBlockMargin,
      droppedTopSpacing,
    });
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
    const height = resolveCutHeight({
      point,
      startHeight,
      isFirstFragment: !dropBlockMargin,
      droppedTopSpacing,
    });
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
  heights,
  gap,
}: PaginateFlowOptions): FlowPage[] => {
  const safeGap = Number.isFinite(gap) ? Math.max(0, gap) : 0;
  const pages: FlowPage[] = [];
  let currentPage: FlowPage = {
    pageIndex: 0,
    usedHeight: 0,
    availableHeight: resolvePageHeight(heights, 0),
    items: [],
  };
  const getCurrentAvailableHeight = () => resolvePageHeight(heights, currentPage.pageIndex);
  const getGapBeforeItem = (sourceModuleKey: string, isContinuation: boolean) => {
    const previousItem = currentPage.items[currentPage.items.length - 1];
    return previousItem && !isContinuation && previousItem.sourceModuleKey !== sourceModuleKey
      ? safeGap
      : 0;
  };

  /** 换页前把模块间距留在上一页页尾：下一个模块换页时这段间距不应凭空消失 */
  const pushPage = (nextModuleKey?: string, keepEmptyPage = false) => {
    if (currentPage.items.length > 0) {
      const lastItem = currentPage.items[currentPage.items.length - 1];
      const isModuleBoundary = Boolean(nextModuleKey) && lastItem.sourceModuleKey !== nextModuleKey;
      if (isModuleBoundary && currentPage.usedHeight + safeGap <= getCurrentAvailableHeight()) {
        currentPage.trailingGap = safeGap;
        currentPage.usedHeight += safeGap;
      }
      pages.push(currentPage);
    } else if (keepEmptyPage) {
      // 首页被前置区域占满时保留空栏页，正文才能与其他区域继续使用同一物理页码。
      pages.push(currentPage);
    }
    const nextPageIndex = pages.length;
    currentPage = {
      pageIndex: nextPageIndex,
      usedHeight: 0,
      availableHeight: resolvePageHeight(heights, nextPageIndex),
      items: [],
    };
  };

  /** 首页剩余槽位不足时让内容从后续完整高度页面开始，避免把小槽位误判为溢出页。 */
  const moveFromShortEmptyPage = (itemHeight: number): boolean => {
    if (currentPage.items.length > 0) return false;
    const currentHeight = getCurrentAvailableHeight();
    const nextHeight = resolvePageHeight(heights, currentPage.pageIndex + 1);
    if (
      itemHeight <= currentHeight + PAGE_HEIGHT_TOLERANCE ||
      nextHeight <= currentHeight + PAGE_HEIGHT_TOLERANCE
    ) return false;
    pushPage(undefined, true);
    return true;
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
    // 两层推进：外层换页，内层填满当前页；本轮是否消费内容由消费量是否前进表示
    let pageTurnsWithoutProgress = 0;
    while (consumedHeight < fullHeight || (fullHeight === 0 && consumedHeight === 0)) {
      const pageStartHeight = consumedHeight;
      const pageStartOffset = consumedOffset;
      const pageStartBlocks = consumedBlocks;
      const startItemCount = currentPage.items.length;
      const startPageIndex = currentPage.pageIndex;
      // 内层反复尝试放置，直到本轮消费了内容；换页与节点结束都在这里退出，由外层决定是否继续
      while (
        consumedHeight === pageStartHeight &&
        consumedOffset === pageStartOffset &&
        consumedBlocks === pageStartBlocks &&
        currentPage.pageIndex === startPageIndex &&
        currentPage.items.length >= startItemCount
      ) {
        const isFirstFragment = consumedHeight === 0;
        const remainingHeight = Math.max(0, fullHeight - consumedHeight);
        // 页面首位且已渲染过内容盒的续段会去掉顶部内边距，口径集中在这里解析
        const activeDroppedTopSpacing = resolveDroppedTopSpacing({
          measurement,
          isFirstFragment,
          atPageStart: currentPage.items.length === 0,
          hasRenderedContent: consumedBlocks > 0 || consumedOffset > 0,
        });
        // 独立间距行位于后续页面首位时不占空间，与渲染层隐藏规则一致。
        const hideLeadingSpacer =
          isFirstFragment &&
          node.hideWhenPageLeading &&
          currentPage.pageIndex > 0 &&
          currentPage.items.length === 0;
        const hiddenSpacerHeight = hideLeadingSpacer ? fullHeight : 0;
        const nodeGap = getGapBeforeItem(node.sourceModuleKey, !isFirstFragment);
        const availableForContent = Math.max(
          0,
          getCurrentAvailableHeight() - currentPage.usedHeight - nodeGap,
        );

        // 整片候选：覆盖当前游标之后的全部内容，高度按渲染层同一口径预扣间距与块外边距
        const wholeHeight = Math.max(
          0,
          remainingHeight -
            hiddenSpacerHeight -
            (isFirstFragment ? 0 : resolveNextBlockMargin(measurement, consumedHeight)) -
            activeDroppedTopSpacing,
        );
        const wholeFragmentKind: FlowFragmentKind = isFirstFragment ? "single" : "last";
        const wholeFragment: FlowPageItem = {
          fragmentId: `${node.id}:${wholeFragmentKind}:${consumedOffset}:${contentEnd}`,
          nodeId: node.id,
          sourceModuleKey: node.sourceModuleKey,
          fragment: wholeFragmentKind,
          height: wholeHeight,
          payload: node.payload,
          contentRange: contentEnd ? { start: consumedOffset, end: contentEnd } : undefined,
          blockRange: blockCount ? { start: consumedBlocks, end: blockCount } : undefined,
        };
        const wholeFits =
          currentPage.items.length === 0
            ? wholeHeight <= getCurrentAvailableHeight() + PAGE_HEIGHT_TOLERANCE
            : currentPage.usedHeight + nodeGap + wholeHeight <=
              getCurrentAvailableHeight() + PAGE_HEIGHT_TOLERANCE;

        // 切割候选：只铺到某个断点为止，高度与覆盖范围都由断点决定
        const breakPoint =
          findBestBreakPoint(
            measurement,
            consumedHeight,
            activeDroppedTopSpacing,
            availableForContent,
            !isFirstFragment,
          ) ||
          (currentPage.items.length === 0
            ? findNextBreakPoint(
                measurement,
                consumedHeight,
                activeDroppedTopSpacing,
                !isFirstFragment,
              )
            : undefined);
        const cut = breakPoint
          ? {
              breakPoint,
              height: Math.max(
                0,
                resolveCutHeight({
                  point: breakPoint,
                  startHeight: consumedHeight,
                  isFirstFragment,
                  droppedTopSpacing: activeDroppedTopSpacing,
                }),
              ),
              coverage: resolveFragmentCut({
                breakPoint,
                blockCount,
                contentEnd,
                consumedBlockCount: consumedBlocks,
                consumedOffset,
              }),
            }
          : undefined;
        // 无法推进高度、正文或块游标的断点不能作为候选，否则会重复输出空分片并丢弃剩余内容。
        const usableCut = cut && (
          cut.breakPoint.height > consumedHeight ||
          cut.coverage.consumedBlockEnd > consumedBlocks ||
          (!cut.coverage.isBlockPoint && cut.breakPoint.offset > consumedOffset)
        )
          ? cut
          : undefined;

        // 选择要放置的候选：整片放得下就整片，否则用能放下的最大断点
        const candidate:
          | { item: FlowPageItem }
          | {
              item: FlowPageItem;
              breakPoint: NonNullable<typeof breakPoint>;
              coverage: NonNullable<typeof cut>["coverage"];
            }
          | undefined = wholeFits
          ? { item: wholeFragment }
          : usableCut
            ? {
                item: {
                  ...wholeFragment,
                  fragment: isFirstFragment ? "first" : "middle",
                  fragmentId: `${node.id}:${isFirstFragment ? "first" : "middle"}:${consumedOffset}:${usableCut.breakPoint.offset}`,
                  height: usableCut.height,
                  contentRange: usableCut.coverage.contentRange,
                  blockRange: usableCut.coverage.blockRange,
                },
                breakPoint: usableCut.breakPoint,
                coverage: usableCut.coverage,
              }
            : undefined;

        if (!candidate) {
          if (currentPage.items.length > 0) {
            // 当前页已有内容且整片与断点都放不下：换页后重试同一游标
            pushPage(node.sourceModuleKey);
            continue;
          }
          if (moveFromShortEmptyPage(wholeFragment.height)) continue;
          // 空页接纳完整剩余内容并交给 PagePlan 标记溢出，保证内容不会被收敛护栏丢弃。
          tryAddItem(wholeFragment, !isFirstFragment);
          consumedHeight = fullHeight;
          consumedOffset = contentEnd;
          consumedBlocks = blockCount;
          break;
        }

        if (moveFromShortEmptyPage(candidate.item.height)) continue;
        if (!tryAddItem(candidate.item, !isFirstFragment)) {
          pushPage();
          continue;
        }
        if (!("coverage" in candidate)) {
          consumedHeight = fullHeight;
          consumedOffset = contentEnd;
          consumedBlocks = blockCount;
          break;
        }

        // 记下推进前的消费量：断点高度不高于已消费高度说明本片没有消费任何内容
        const fragmentHeightBefore = consumedHeight;
        const fragmentOffsetBefore = consumedOffset;
        const fragmentBlocksBefore = consumedBlocks;
        consumedHeight = candidate.breakPoint.height;
        consumedBlocks = candidate.coverage.consumedBlockEnd;
        if (!candidate.coverage.isBlockPoint) consumedOffset = candidate.breakPoint.offset;
        // 高度、正文与块游标任一推进都表示该分片有效，避免零高度块被误判为没有消费内容。
        if (
          consumedHeight <= fragmentHeightBefore &&
          consumedOffset <= fragmentOffsetBefore &&
          consumedBlocks <= fragmentBlocksBefore
        ) break;
        // 块与正文都已切到末尾时结束，避免产生高度不为零但内容为空的尾分片
        if (consumedOffset >= contentEnd && consumedBlocks >= blockCount) break;
      }
      // 本轮消费了内容就继续填当前页；只是换页也允许重试一次
      if (
        consumedHeight > pageStartHeight ||
        consumedOffset > pageStartOffset ||
        consumedBlocks > pageStartBlocks
      ) {
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
