import type { BreakPointMeasure } from "../measure/types";

/** 切割点覆盖的块区间：区间为 [start, end)，start 为已消费块序号，end 为本次覆盖到的块序号 */
export interface CutBlockRange {
  /** 已消费到的块序号 */
  start: number;
  /** 本片覆盖到的块序号 */
  end: number;
}

/** 切割点解析结果：分页层据它决定分片高度与内容、块覆盖区间 */
export interface FragmentCut {
  /** 当前切割点是否为块断点：块断点不覆盖正文区间 */
  isBlockPoint: boolean;
  /** 本片覆盖到的块序号 */
  coveredBlockCount: number;
  /** 推进后的已消费块序号：文本断点已切到内容末尾时直接跳到全部块 */
  consumedBlockEnd: number;
  /** 本片应覆盖的块区间，节点没有块时为空 */
  blockRange?: CutBlockRange;
  /** 本片应覆盖的正文区间，块断点不覆盖正文时为空 */
  contentRange?: { start: number; end: number };
}

/** 切割点解析参数 */
export interface ResolveFragmentCutOptions {
  /** 当前切割点：块断点带 blockEnd，其余断点没有 */
  breakPoint: BreakPointMeasure;
  /** 节点渲染块总数 */
  blockCount: number;
  /** 节点内容的末尾偏移 */
  contentEnd: number;
  /** 已消费到的块序号 */
  consumedBlockCount: number;
  /** 已消费到的正文偏移 */
  consumedOffset: number;
}

/**
 * 解析切割点覆盖的范围。
 * 块断点只覆盖块、不覆盖正文区间；文本断点覆盖剩余全部块与正文区间。
 * 文本断点已经切到内容末尾时同样覆盖到全部块，避免留下高度不为零但内容为空的尾分片。
 */
export const resolveFragmentCut = ({
  breakPoint,
  blockCount,
  contentEnd,
  consumedBlockCount,
  consumedOffset,
}: ResolveFragmentCutOptions): FragmentCut => {
  // 最后的正文块承载全部剩余字符，文本切过后不能再次按完整正文渲染。
  const coversRemainingText = consumedOffset > 0 && contentEnd > 0 && breakPoint.blockEnd === blockCount;
  const isBlockPoint = typeof breakPoint.blockEnd === "number" && !coversRemainingText;
  const endOffset = coversRemainingText ? contentEnd : breakPoint.offset;
  const coveredBlockCount = typeof breakPoint.blockEnd === "number" ? Number(breakPoint.blockEnd) : blockCount;
  const consumedBlockEnd =
    isBlockPoint || endOffset >= contentEnd
      ? coveredBlockCount
      : Math.max(consumedBlockCount, blockCount - 1);

  return {
    isBlockPoint,
    coveredBlockCount,
    consumedBlockEnd,
    blockRange: blockCount ? { start: consumedBlockCount, end: coveredBlockCount } : undefined,
    contentRange: isBlockPoint
      ? undefined
      : { start: consumedOffset, end: endOffset },
  };
};
