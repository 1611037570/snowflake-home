import type { BreakPointType } from "../types";

/** 一个可拆分断点的真实高度信息 */
export interface BreakPointMeasure {
  /** 断点在节点内容中的位置 */
  offset: number;
  /** 断点对应的语义类型 */
  type: BreakPointType;
  /** 从节点起点到当前断点的实际高度（流内口径：接在一段已有内容之后渲染） */
  height: number;
  /**
   * 当前断点落在页面首位时的高度（页首口径）。
   * 页首渲染会移除所在块的上外边距，这里直接给出扣除后的高度，
   * 分页层只需按分片位置选择口径，不再自行做几何扣减。
   * 测量层始终会给出该值，缺省时按流内口径处理。
   */
  heightAtPageStart?: number;
  /** 块断点覆盖的块数量：区间为 [0, blockEnd)，仅块断点存在 */
  blockEnd?: number;
  /** 块自身的外边距：续段落在页首时渲染层会去掉它，仅作为页首口径的来源保留 */
  leadingMargin?: number;
}

/** 分页前用于计算节点占用空间的测量结果 */
export interface MeasuredNode {
  /** 对应的排版节点编号 */
  nodeId: string;
  /** 当前节点的实际测量宽度 */
  width: number;
  /** 当前节点完整内容的实际高度 */
  fullHeight: number;
  /** 当前节点允许的最小高度 */
  minHeight: number;
  /** 当前节点可用的拆分断点 */
  breakPoints: BreakPointMeasure[];
  /** 续段渲染时被去掉的顶部留白高度 */
  droppedTopSpacing?: number;
}
