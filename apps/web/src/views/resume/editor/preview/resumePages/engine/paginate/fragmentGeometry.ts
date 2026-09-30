import type { BreakPointMeasure, MeasuredNode } from "../measure/types";

/**
 * 分片几何口径。
 *
 * 分页层需要知道"同一段内容在页首渲染时比在流中渲染矮多少"，这件事只由渲染层的留白规则决定：
 *   - 块上外边距：分片不是节点首片时渲染层不绘制它（middle/last 装饰在页首与页中都不画）；
 *   - 内容盒上内边距：续段落在页面首位、且内容盒首块已由前面分片渲染过时才被移除。
 * 两条留白的扣除条件不同，这里集中定义，分页层只调用不再自行做算术。
 */

/** 读取切割点自身的外边距：只有块断点带该字段 */
export const resolveBlockMargin = (point: BreakPointMeasure): number => point.leadingMargin ?? 0;

/**
 * 解析切割点相对当前游标的高度（即"再放这么多就能切到这里"）。
 * 排序与分片高度必须使用同一个值，否则会选中与游标不一致的断点。
 */
export const resolveCutHeight = ({
  point,
  startHeight,
  isFirstFragment,
  droppedTopSpacing,
}: {
  /** 当前候选切割点 */
  point: BreakPointMeasure;
  /** 已消费到的节点高度 */
  startHeight: number;
  /** 当前分片是否为节点首片：续段不绘制所在块的上外边距 */
  isFirstFragment: boolean;
  /** 续段落在页首且内容盒已开始时扣除的顶部内边距 */
  droppedTopSpacing: number;
}): number =>
  isFirstFragment
    ? point.height - startHeight
    : point.height -
      startHeight -
      (startHeight > 0 ? droppedTopSpacing : 0) -
      resolveBlockMargin(point);

/**
 * 解析续段落在页面首位时真正被移除的顶部内边距。
 * 只在"内容盒首块已由前面分片渲染过"时成立：只放了间距的分片不渲染内容盒，此时续段仍是完整盒顶。
 */
export const resolveDroppedTopSpacing = ({
  measurement,
  isFirstFragment,
  atPageStart,
  hasRenderedContent,
}: {
  /** 节点测量结果 */
  measurement: MeasuredNode;
  /** 当前分片是否为节点首片 */
  isFirstFragment: boolean;
  /** 当前分片是否落在页面首位 */
  atPageStart: boolean;
  /** 内容盒首块是否已由前面分片渲染过 */
  hasRenderedContent: boolean;
}): number =>
  !isFirstFragment && atPageStart && hasRenderedContent ? (measurement.droppedTopSpacing ?? 0) : 0;

/** 读取当前游标之后第一个未消费块的上外边距，用于整片预扣 */
export const resolveNextBlockMargin = (
  measurement: MeasuredNode,
  startHeight: number,
): number =>
  measurement.breakPoints.find(
    (point) => point.blockEnd !== undefined && point.height > startHeight,
  )?.leadingMargin ?? 0;
