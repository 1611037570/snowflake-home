import { describe, expect, it } from "vitest";
import { paginateFlow, type FlowPage } from "./paginateFlow";
import type { MeasuredNode } from "../measure/types";
import type { LayoutNode } from "../types";

/**
 * 整片与切割共用同一套放置逻辑后的行为基线。
 * 用例按「整片放下 / 整片放不下改切 / 空页无断点回退 / 间距页首隐藏 / 页尾间距」五条路径各覆盖一次，
 * 断言到每一页的分片、高度与覆盖区间，防止后续合并或调优改变可观测结果。
 */

const createNode = (id: string, overrides: Partial<LayoutNode> = {}): LayoutNode => ({
  id,
  sourceModuleKey: "test",
  type: "block",
  payload: { id },
  ...overrides,
});

const createMeasurement = (
  id: string,
  fullHeight: number,
  breakPoints: MeasuredNode["breakPoints"] = [],
  droppedTopSpacing?: number,
): MeasuredNode => ({
  nodeId: id,
  width: 300,
  fullHeight,
  breakPoints,
  droppedTopSpacing,
});

/** 把分页结果压成可直接比较的结构 */
const summarize = (pages: FlowPage[]) =>
  pages.map((page) => ({
    used: page.usedHeight,
    trailingGap: page.trailingGap ?? null,
    items: page.items.map((item) => ({
      nodeId: item.nodeId,
      fragment: item.fragment,
      height: item.height,
      blockRange: item.blockRange ?? null,
      contentRange: item.contentRange ?? null,
    })),
  }));

describe("paginateFlow 放置路径基线", () => {
  it("整片放得下时整片放下，后续节点继续填当前页", () => {
    const pages = paginateFlow({
      nodes: [createNode("item"), createNode("second")],
      measurements: new Map([
        ["item", createMeasurement("item", 60, [{ offset: 0, type: "block", height: 60, blockEnd: 1 }])],
        ["second", createMeasurement("second", 30)],
      ]),
      heights: { firstPageHeight: 100, laterPageHeight: 100 },
      gap: 0,
    });

    expect(summarize(pages)).toEqual([
      {
        used: 90,
        trailingGap: null,
        items: [
          { nodeId: "item", fragment: "single", height: 60, blockRange: { start: 0, end: 1 }, contentRange: null },
          { nodeId: "second", fragment: "single", height: 30, blockRange: null, contentRange: null },
        ],
      },
    ]);
  });

  it("整片放不下时按当前页能容纳的最大断点切片，逐页顺延", () => {
    const pages = paginateFlow({
      nodes: [createNode("item")],
      measurements: new Map([
        [
          "item",
          createMeasurement("item", 120, [
            { offset: 0, type: "block", height: 40, blockEnd: 1 },
            { offset: 0, type: "block", height: 90, blockEnd: 2 },
            { offset: 20, type: "paragraph", height: 120 },
          ]),
        ],
      ]),
      heights: { firstPageHeight: 60, laterPageHeight: 60 },
      gap: 0,
    });

    expect(summarize(pages).map((page) => page.items.map((item) => [item.fragment, item.height]))).toEqual([
      [["first", 40]],
      [["middle", 50]],
      [["last", 30]],
    ]);
  });

  it("续段落在页首时扣除块上外边距与顶部内边距", () => {
    const pages = paginateFlow({
      nodes: [createNode("previous"), createNode("item")],
      measurements: new Map([
        ["previous", createMeasurement("previous", 30)],
        [
          "item",
          createMeasurement(
            "item",
            120,
            [
              { offset: 0, type: "block", height: 10, blockEnd: 0 },
              { offset: 0, type: "block", height: 60, blockEnd: 1, leadingMargin: 5 },
              { offset: 20, type: "paragraph", height: 120 },
            ],
            10,
          ),
        ],
      ]),
      heights: { firstPageHeight: 95, laterPageHeight: 95 },
      gap: 0,
    });

    expect(summarize(pages)).toEqual([
      {
        used: 90,
        trailingGap: null,
        items: [
          { nodeId: "previous", fragment: "single", height: 30, blockRange: null, contentRange: null },
          { nodeId: "item", fragment: "first", height: 60, blockRange: { start: 0, end: 1 }, contentRange: null },
        ],
      },
      {
        used: 50,
        trailingGap: null,
        items: [
          {
            nodeId: "item",
            fragment: "last",
            height: 50,
            blockRange: { start: 1, end: 1 },
            contentRange: { start: 0, end: 20 },
          },
        ],
      },
    ]);
  });

  it("空页没有任何断点时整片放下，避免反复换页", () => {
    const pages = paginateFlow({
      nodes: [createNode("item")],
      measurements: new Map([["item", createMeasurement("item", 80)]]),
      heights: { firstPageHeight: 50, laterPageHeight: 50 },
      gap: 0,
    });

    // 放不下也放：这是收敛兜底，代价是溢出当前页
    expect(summarize(pages)).toEqual([
      {
        used: 80,
        trailingGap: null,
        items: [
          { nodeId: "item", fragment: "single", height: 80, blockRange: null, contentRange: null },
        ],
      },
    ]);
  });

  it("间距节点落页首隐藏占位，与内容一起顺延", () => {
    const pages = paginateFlow({
      nodes: [
        createNode("previous"),
        createNode("item.paragraph-spacing", {
          type: "spacer",
          hideWhenPageLeading: true,
          payload: { height: 10 },
        }),
        createNode("item"),
      ],
      measurements: new Map([
        ["previous", createMeasurement("previous", 45)],
        ["item.paragraph-spacing", createMeasurement("item.paragraph-spacing", 10)],
        ["item", createMeasurement("item", 50)],
      ]),
      heights: { firstPageHeight: 50, laterPageHeight: 50 },
      gap: 0,
    });

    expect(summarize(pages)).toEqual([
      {
        used: 45,
        trailingGap: null,
        items: [
          { nodeId: "previous", fragment: "single", height: 45, blockRange: null, contentRange: null },
        ],
      },
      {
        used: 50,
        trailingGap: null,
        items: [
          { nodeId: "item.paragraph-spacing", fragment: "single", height: 0, blockRange: null, contentRange: null },
          { nodeId: "item", fragment: "single", height: 50, blockRange: null, contentRange: null },
        ],
      },
    ]);
  });

  it("换页时模块间距留在上一页页尾", () => {
    const pages = paginateFlow({
      nodes: [
        createNode("first", { sourceModuleKey: "alpha" }),
        createNode("second", { sourceModuleKey: "beta" }),
      ],
      measurements: new Map([
        ["first", createMeasurement("first", 40)],
        ["second", createMeasurement("second", 60)],
      ]),
      heights: { firstPageHeight: 70, laterPageHeight: 70 },
      gap: 12,
    });

    expect(summarize(pages)).toEqual([
      {
        used: 52,
        trailingGap: 12,
        items: [
          { nodeId: "first", fragment: "single", height: 40, blockRange: null, contentRange: null },
        ],
      },
      {
        used: 60,
        trailingGap: null,
        items: [
          { nodeId: "second", fragment: "single", height: 60, blockRange: null, contentRange: null },
        ],
      },
    ]);
  });

  it("首页与后续页可用高度不同时按各自高度分页", () => {
    const pages = paginateFlow({
      nodes: [createNode("item")],
      measurements: new Map([
        [
          "item",
          createMeasurement("item", 200, [
            { offset: 0, type: "block", height: 50, blockEnd: 1 },
            { offset: 10, type: "paragraph", height: 120 },
            { offset: 20, type: "paragraph", height: 200 },
          ]),
        ],
      ]),
      heights: { firstPageHeight: 60, laterPageHeight: 50 },
      gap: 0,
    });

    expect(summarize(pages).map((page) => page.used)).toEqual([50, 70, 80]);
  });
});
