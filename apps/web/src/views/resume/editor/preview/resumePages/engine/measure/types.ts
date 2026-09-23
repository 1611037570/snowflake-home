import type { BreakPointType } from "../types";

/** 一个可拆分断点的真实高度信息 */
export interface BreakPointMeasure {
  /** 断点在节点内容中的位置 */
  offset: number;
  /** 断点对应的语义类型 */
  type: BreakPointType;
  /** 从节点起点到当前断点的实际高度 */
  height: number;
  /** 续页首段不重复计算的段落间距；空行保留，不为段落分页预留行数 */
  continuationGap?: number;
  /** 块断点覆盖的块数量：区间为 [0, blockEnd)，仅块断点存在 */
  blockEnd?: number;
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
  /** 节点内容容器被去掉的上下内边距：续段按装饰口径不重复计入 */
  droppedPadding?: { top: number; bottom: number };
}
