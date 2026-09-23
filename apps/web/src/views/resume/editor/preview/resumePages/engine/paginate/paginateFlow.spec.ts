import { describe, expect, it } from "vitest";
import { paginateFlow } from "./paginateFlow";
import type { MeasuredNode } from "../measure/types";
import type { LayoutNode } from "../types";

const createNode = (id: string, overrides: Partial<LayoutNode> = {}): LayoutNode => ({
  id,
  sourceModuleKey: "test",
  type: "block",
  breakPolicy: {
    splittable: false,
    keepWithNext: false,
    keepTitleWithFirst: false,
  },
  payload: { id },
  ...overrides,
});

const createMeasurement = (
  nodeId: string,
  fullHeight: number,
  overrides: Partial<MeasuredNode> = {},
): MeasuredNode => ({
  nodeId,
  width: 300,
  fullHeight,
  minHeight: 0,
  breakPoints: [],
  ...overrides,
});

describe("paginateFlow", () => {
  it("按节点高度和间距生成单栏分页", () => {
    const nodes = [createNode("first"), createNode("second")];
    const measurements = new Map([
      ["first", createMeasurement("first", 40)],
      ["second", createMeasurement("second", 70)],
    ]);

    const pages = paginateFlow({
      nodes,
      measurements,
      availableHeight: 100,
      gap: 10,
    });

    expect(pages).toHaveLength(2);
    expect(pages[0]?.items.map((item) => item.nodeId)).toEqual(["first"]);
    expect(pages[1]?.items.map((item) => item.nodeId)).toEqual(["second"]);
  });

  it("正文放不下时标题与条目头留在当前页，正文顺延下一页", () => {
    const title = createNode("title", { payload: "模块标题" });
    const item = createNode("item", {
      type: "group",
      title,
      breakPolicy: {
        splittable: true,
        keepWithNext: false,
        keepTitleWithFirst: true,
      },
    });
    const measurements = new Map([
      ["first", createMeasurement("first", 40)],
      ["title", createMeasurement("title", 20)],
      [
        "item",
        createMeasurement("item", 160, {
          breakPoints: [
            { offset: 0, type: "paragraph", height: 75 },
            { offset: 5, type: "paragraph", height: 120 },
            { offset: 10, type: "paragraph", height: 160 },
          ],
        }),
      ],
    ]);

    const pages = paginateFlow({
      nodes: [createNode("first"), item],
      measurements,
      availableHeight: 150,
      gap: 10,
    });

    // 标题与条目头留在第一页，正文到第二页
    expect(pages).toHaveLength(2);
    expect(pages[0]?.items.map((flowItem) => [flowItem.nodeId, flowItem.fragment])).toEqual([
      ["first", "single"],
      ["item", "first"],
    ]);
    expect(pages[0]?.items[1]?.contentRange).toEqual({ start: 0, end: 0 });
    expect(pages[0]?.items[1]?.titlePayload).toBe("模块标题");
    expect(pages[1]?.items.map((flowItem) => [flowItem.nodeId, flowItem.fragment])).toEqual([
      ["item", "last"],
    ]);
    expect(pages[1]?.items[0]?.titlePayload).toBeUndefined();
  });

  it("标题只出现在首片，内容续段不重复标题", () => {
    const title = createNode("title", {
      type: "block",
      payload: "模块标题",
      breakPolicy: {
        splittable: false,
        keepWithNext: false,
        keepTitleWithFirst: false,
      },
    });
    const content = createNode("content", {
      type: "richText",
      title,
      breakPolicy: {
        splittable: true,
        keepWithNext: false,
        keepTitleWithFirst: true,
      },
    });
    const measurements = new Map([
      ["title", createMeasurement("title", 20)],
      [
        "content",
        createMeasurement("content", 100, {
          breakPoints: [
            { offset: 5, type: "paragraph", height: 40 },
            { offset: 10, type: "paragraph", height: 100 },
          ],
        }),
      ],
    ]);

    const pages = paginateFlow({
      nodes: [content],
      measurements,
      availableHeight: 70,
      gap: 0,
    });

    expect(pages).toHaveLength(2);
    expect(pages[0]?.items[0]).toMatchObject({
      fragment: "first",
      titleNodeId: "title",
      contentRange: { start: 0, end: 5 },
    });
    expect(pages[1]?.items[0]).toMatchObject({
      fragment: "last",
      titleNodeId: undefined,
      contentRange: { start: 5, end: 10 },
    });
  });

  it("缺少测量结果时直接抛出错误", () => {
    expect(() =>
      paginateFlow({
        nodes: [createNode("missing")],
        measurements: new Map(),
        availableHeight: 100,
        gap: 0,
      }),
    ).toThrow("缺少排版节点测量结果：missing");
  });

  it("长段落存在字符级断点时不会整段溢出空页", () => {
    const node = createNode("long-text", {
      breakPolicy: {
        splittable: true,
        keepWithNext: false,
        keepTitleWithFirst: false,
      },
    });
    const pages = paginateFlow({
      nodes: [node],
      measurements: new Map([
        [
          node.id,
          {
            nodeId: node.id,
            width: 300,
            fullHeight: 180,
            minHeight: 20,
            breakPoints: [
              { offset: 4, type: "char", height: 20 },
              { offset: 8, type: "char", height: 40 },
              { offset: 12, type: "char", height: 60 },
              { offset: 16, type: "char", height: 80 },
              { offset: 20, type: "char", height: 100 },
              { offset: 24, type: "char", height: 120 },
              { offset: 28, type: "char", height: 140 },
              { offset: 32, type: "char", height: 160 },
              { offset: 36, type: "textRange", height: 180 },
            ],
          },
        ],
      ]),
      availableHeight: 60,
      gap: 0,
    });

    expect(pages.length).toBeGreaterThan(1);
    expect(pages.every((page) => page.usedHeight <= 60)).toBe(true);
  });

  it("经历正文跨页后续页继续渲染正文块，不重复头部块", () => {
    const node = createNode("education-item", {
      type: "group",
      breakPolicy: {
        splittable: true,
        keepWithNext: false,
        keepTitleWithFirst: false,
      },
    });
    const pages = paginateFlow({
      nodes: [node],
      measurements: new Map([
        [
          node.id,
          createMeasurement("education-item", 100, {
            breakPoints: [
              { offset: 0, type: "block", height: 20, blockEnd: 1 },
              { offset: 0, type: "block", height: 30, blockEnd: 2 },
              { offset: 0, type: "block", height: 40, blockEnd: 3 },
              { offset: 20, type: "paragraph", height: 60 },
              { offset: 40, type: "paragraph", height: 80 },
              { offset: 60, type: "paragraph", height: 100 },
            ],
          }),
        ],
      ]),
      availableHeight: 65,
      gap: 0,
    });

    expect(pages).toHaveLength(2);
    expect(pages[0]?.items[0]).toMatchObject({
      contentRange: { start: 0, end: 20 },
      blockRange: { start: 0, end: 3 },
    });
    expect(pages[1]?.items[0]).toMatchObject({
      contentRange: { start: 20, end: 60 },
      blockRange: { start: 2, end: 3 },
    });
  });

  it("续段不重复计算断点前的段落间距并填充当前页", () => {
    const previous = createNode("previous");
    const content = createNode("content", {
      type: "richText",
      breakPolicy: {
        splittable: true,
        keepWithNext: false,
        keepTitleWithFirst: false,
      },
    });
    const pages = paginateFlow({
      nodes: [previous, content],
      measurements: new Map([
        ["previous", createMeasurement("previous", 60)],
        [
          "content",
          createMeasurement("content", 100, {
            breakPoints: [
              { offset: 5, type: "paragraph", height: 20, continuationGap: 10 },
              { offset: 7, type: "char", height: 43 },
              { offset: 10, type: "paragraph", height: 56 },
            ],
          }),
        ],
      ]),
      availableHeight: 100,
      gap: 0,
    });

    expect(pages[0]?.items.map((item) => item.nodeId)).toEqual([
      "previous",
      "content",
      "content",
    ]);
    expect(pages[0]?.items.slice(1).map((item) => item.contentRange)).toEqual([
      { start: 0, end: 5 },
      { start: 5, end: 7 },
    ]);
    expect(pages[0]?.usedHeight).toBe(93);
  });
});
