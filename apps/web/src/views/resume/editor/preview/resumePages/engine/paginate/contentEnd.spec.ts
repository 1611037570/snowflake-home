import { describe, expect, it } from "vitest";
import { paginateFlow, type FlowPageItem } from "./paginateFlow";
import type { MeasuredNode } from "../measure/types";
import type { LayoutNode } from "../types";

/**
 * 内容末尾推导的回归用例。
 * 块断点的偏移恒为零，若把它当作"断点序列最后一项"来推导内容末尾，末尾会被低估成零：
 * 续段的起始偏移回退到零，且首片不携带正文区间，渲染层会把整段正文渲染两遍。
 */

const createNode = (id: string): LayoutNode => ({
  id,
  sourceModuleKey: "test",
  type: "group",
  breakPolicy: {},
  payload: { id },
});

/** 收集某一页分片覆盖的正文区间 */
const collectTextRanges = (items: FlowPageItem[]) =>
  items
    .map((item) => item.contentRange)
    .filter((range): range is { start: number; end: number } => Boolean(range));

describe("内容末尾推导", () => {
  it("正文区间必须带结束偏移，不能让分片渲染整段正文", () => {
    // 断点数组里文本断点排在块断点之前：内容末尾取自真实长度而不是数组顺序
    const measurement: MeasuredNode = {
      nodeId: "item",
      width: 300,
      fullHeight: 120,
      minHeight: 0,
      contentLength: 20,
      breakPoints: [
        { offset: 20, type: "textRange", height: 120 },
        { offset: 0, type: "block", height: 40, blockEnd: 1 },
        { offset: 0, type: "block", height: 90, blockEnd: 2 },
      ],
    };

    const pages = paginateFlow({
      nodes: [createNode("item")],
      measurements: new Map([["item", measurement]]),
      heights: { firstPageHeight: 60, laterPageHeight: 60 },
      gap: 0,
    });

    const items = pages.flatMap((page) => page.items);
    // 只有块断点分片允许不带正文区间（它不渲染正文）；文本分片必须同时给出起止偏移
    items.forEach((item) => {
      if (item.blockRange && !item.contentRange) return;
      expect(item.contentRange).toBeDefined();
      expect(Number.isFinite(item.contentRange?.end)).toBe(true);
    });

    // 正文区间合起来必须恰好覆盖 [0, 20)，既不遗漏也不重叠
    const ranges = collectTextRanges(items).sort((left, right) => left.start - right.start);
    expect(ranges.length).toBeGreaterThan(0);
    expect(ranges[0]?.start).toBe(0);
    expect(ranges.at(-1)?.end).toBe(20);
    ranges.forEach((range, index) => {
      if (index === 0) return;
      expect(range.start).toBe(ranges[index - 1]?.end);
    });
  });

  it("块断点排在文本断点之后时，续段从零重来会渲染重复正文", () => {
    const measurement: MeasuredNode = {
      nodeId: "item",
      width: 300,
      fullHeight: 120,
      minHeight: 0,
      contentLength: 20,
      breakPoints: [
        { offset: 20, type: "textRange", height: 120 },
        { offset: 0, type: "block", height: 40, blockEnd: 1 },
        { offset: 0, type: "block", height: 90, blockEnd: 2 },
      ],
    };

    const pages = paginateFlow({
      nodes: [createNode("item")],
      measurements: new Map([["item", measurement]]),
      heights: { firstPageHeight: 60, laterPageHeight: 60 },
      gap: 0,
    });

    // 首片是块断点分片：它不渲染正文，正文必须整体留给续段且带结束偏移
    const firstPageItems = pages[0]?.items ?? [];
    expect(firstPageItems.every((item) => !item.contentRange)).toBe(true);
    const continuationRange = pages.flatMap((page) => page.items).find((item) => item.contentRange);
    expect(continuationRange?.contentRange).toEqual({ start: 0, end: 20 });
  });

  it("测量结果缺失正文长度时用断点偏移最大值兜底，不退回数组末项", () => {
    const measurement: MeasuredNode = {
      nodeId: "item",
      width: 300,
      fullHeight: 120,
      minHeight: 0,
      breakPoints: [
        { offset: 20, type: "textRange", height: 120 },
        { offset: 0, type: "block", height: 40, blockEnd: 1 },
      ],
    };

    const pages = paginateFlow({
      nodes: [createNode("item")],
      measurements: new Map([["item", measurement]]),
      heights: { firstPageHeight: 60, laterPageHeight: 60 },
      gap: 0,
    });

    // 兜底同样取最大值，末尾仍是 20 而不是数组末项块断点的 0
    const ranges = collectTextRanges(pages.flatMap((page) => page.items));
    expect(ranges.at(-1)?.end).toBe(20);
  });
});
