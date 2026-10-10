import { describe, expect, it } from "vitest";
import { resolveFragmentCut } from "./cutPoints";
import type { BreakPointMeasure } from "../measure/types";

/** 构造块断点 */
const createBlockPoint = (
  blockEnd: number,
  height: number,
  leadingMargin?: number,
): BreakPointMeasure => ({ offset: 0, type: "block", height, blockEnd, leadingMargin });

/** 构造文本断点 */
const createTextPoint = (offset: number, height: number): BreakPointMeasure => ({
  offset,
  type: "textRange",
  height,
});

describe("resolveFragmentCut", () => {
  it("字符切过后末尾块仅覆盖剩余正文，不重复已消费字符", () => {
    const cut = resolveFragmentCut({
      breakPoint: createBlockPoint(4, 120), // 最后正文块断点
      blockCount: 4, // 块结束编号
      contentEnd: 10, // 完整正文长度
      consumedBlockCount: 3, // 前部块已经消费
      consumedOffset: 5, // 正文前半段已经消费
    });
    expect(cut.isBlockPoint).toBe(false);
    expect(cut.contentRange).toEqual({ start: 5 /* 剩余字符起点 */, end: 10 /* 正文末尾 */ });
    expect(cut.consumedBlockEnd).toBe(4);
  });
  it("块断点只覆盖块，不产生正文区间", () => {
    const cut = resolveFragmentCut({
      breakPoint: createBlockPoint(2, 40),
      blockCount: 3,
      contentEnd: 100,
      consumedBlockCount: 0,
      consumedOffset: 0,
    });

    expect(cut.isBlockPoint).toBe(true);
    expect(cut.blockRange).toEqual({ start: 0, end: 2 });
    expect(cut.consumedBlockEnd).toBe(2);
    expect(cut.contentRange).toBeUndefined();
  });

  it("文本断点覆盖剩余全部块与本次正文区间", () => {
    const cut = resolveFragmentCut({
      breakPoint: createTextPoint(30, 50),
      blockCount: 3,
      contentEnd: 100,
      consumedBlockCount: 0,
      consumedOffset: 0,
    });

    expect(cut.isBlockPoint).toBe(false);
    expect(cut.coveredBlockCount).toBe(3);
    expect(cut.contentRange).toEqual({ start: 0, end: 30 });
    // 正文还没切到末尾，块游标只推进到最后一个块之前，留给后续分片
    expect(cut.consumedBlockEnd).toBe(2);
  });

  it("文本断点切到内容末尾时块游标直接推进到全部块", () => {
    const cut = resolveFragmentCut({
      breakPoint: createTextPoint(100, 80),
      blockCount: 3,
      contentEnd: 100,
      consumedBlockCount: 0,
      consumedOffset: 0,
    });

    expect(cut.coveredBlockCount).toBe(3);
    expect(cut.consumedBlockEnd).toBe(3);
    expect(cut.contentRange).toEqual({ start: 0, end: 100 });
  });

  it("节点没有块时块区间为空，块游标保持已消费值", () => {
    const cut = resolveFragmentCut({
      breakPoint: createTextPoint(20, 30),
      blockCount: 0,
      contentEnd: 60,
      consumedBlockCount: 0,
      consumedOffset: 0,
    });

    expect(cut.blockRange).toBeUndefined();
    expect(cut.coveredBlockCount).toBe(0);
    expect(cut.consumedBlockEnd).toBe(0);
    expect(cut.contentRange).toEqual({ start: 0, end: 20 });
  });

  it("续段的块区间起点接在已消费块之后", () => {
    const cut = resolveFragmentCut({
      breakPoint: createBlockPoint(3, 70),
      blockCount: 3,
      contentEnd: 0,
      consumedBlockCount: 2,
      consumedOffset: 0,
    });

    expect(cut.blockRange).toEqual({ start: 2, end: 3 });
  });
});
