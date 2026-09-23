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
        keepTitleWithFirst: false,
      },
    });
    const content = createNode("content", {
      type: "richText",
      title,
      breakPolicy: {
        splittable: true,
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

  it("续段不重复计算断点前的段落间距，当前页不预留额外空间", () => {
    const previous = createNode("previous");
    const content = createNode("content", {
      type: "richText",
      breakPolicy: {
        splittable: true,
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
              { offset: 5, type: "paragraph", height: 20 },
              { offset: 7, type: "char", height: 43 },
              { offset: 10, type: "paragraph", height: 56 },
            ],
          }),
        ],
      ]),
      availableHeight: 100,
      gap: 0,
    });

    expect(pages[0]?.items.map((item) => item.nodeId)).toEqual(["previous", "content"]);
    expect(pages[0]?.items[1]?.contentRange).toEqual({ start: 0, end: 5 });
    expect(pages[0]?.usedHeight).toBe(80);
  });

  it("续页扣除被移除的顶部内边距后继续填满当前页", () => {
    const content = createNode("content", {
      type: "richText",
      breakPolicy: {
        splittable: true,
        keepTitleWithFirst: false,
      },
    });
    const breakPoints = Array.from({ length: 10 }, (_, index) => ({
      offset: (index + 1) * 10,
      type: "char" as const,
      height: (index + 1) * 10,
    }));
    const pages = paginateFlow({
      nodes: [content],
      measurements: new Map([
        [
          content.id,
          createMeasurement("content", 100, {
            breakPoints,
            droppedTopSpacing: 10,
          }),
        ],
      ]),
      availableHeight: 50,
      availableHeightByPage: (pageIndex) => (pageIndex === 0 ? 50 : 45),
      gap: 0,
    });

    expect(pages).toHaveLength(2);
    expect(pages[1]?.items[0]).toMatchObject({
      contentRange: { start: 50, end: 100 },
      height: 40,
    });
    expect(pages[1]?.usedHeight).toBe(40);
  });

  it("断点顺序不固定时选择当前页能容纳的最大断点", () => {
    const content = createNode("content", {
      type: "richText",
      breakPolicy: {
        splittable: true,
        keepTitleWithFirst: false,
      },
    });
    const pages = paginateFlow({
      nodes: [content],
      measurements: new Map([
        [
          content.id,
          createMeasurement("content", 60, {
            breakPoints: [
              { offset: 4, type: "char", height: 40 },
              { offset: 6, type: "char", height: 60 },
              { offset: 2, type: "char", height: 20 },
            ],
          }),
        ],
      ]),
      availableHeight: 50,
      gap: 0,
    });

    expect(pages[0]?.items[0]).toMatchObject({
      contentRange: { start: 0, end: 4 },
      height: 40,
    });
  });

  it("同一模块标题和内容之间不重复加入模块间距", () => {
    const title = createNode("video.title", {
      sourceModuleKey: "video",
      payload: "视频作品",
    });
    const content = createNode("video.media-0", {
      sourceModuleKey: "video",
      type: "media",
      title,
      breakPolicy: {
        splittable: false,
        keepTitleWithFirst: true,
      },
    });
    const pages = paginateFlow({
      nodes: [createNode("video.previous", { sourceModuleKey: "video" }), content],
      measurements: new Map([
        ["video.previous", createMeasurement("video.previous", 50)],
        ["video.title", createMeasurement("video.title", 10)],
        ["video.media-0", createMeasurement("video.media-0", 40)],
      ]),
      availableHeight: 100,
      gap: 10,
    });

    expect(pages).toHaveLength(1);
    expect(pages[0]?.items.map((item) => item.fragment)).toEqual(["single", "single"]);
    expect(pages[0]?.usedHeight).toBe(100);
  });

  it("当前页放得下媒体条目的首个内容块时不整条顺延", () => {
    const title = createNode("video.title", {
      sourceModuleKey: "video",
      payload: "视频作品",
    });
    const content = createNode("video.media-0", {
      sourceModuleKey: "video",
      type: "media",
      title,
      breakPolicy: {
        splittable: true,
        keepTitleWithFirst: true,
      },
    });
    const pages = paginateFlow({
      nodes: [content],
      measurements: new Map([
        ["video.title", createMeasurement("video.title", 20)],
        [
          "video.media-0",
          createMeasurement("video.media-0", 100, {
            breakPoints: [
              { offset: 0, type: "block", height: 40, blockEnd: 1 },
              { offset: 0, type: "block", height: 100, blockEnd: 2 },
            ],
            droppedTopSpacing: 10,
          }),
        ],
      ]),
      availableHeight: 60,
      availableHeightByPage: (pageIndex) => (pageIndex === 0 ? 60 : 50),
      gap: 10,
    });

    expect(pages).toHaveLength(2);
    expect(pages[0]?.items[0]).toMatchObject({
      fragment: "first",
      titlePayload: "视频作品",
      blockRange: { start: 0, end: 1 },
      height: 60,
    });
    expect(pages[0]?.usedHeight).toBe(60);
    expect(pages[1]?.items[0]).toMatchObject({
      fragment: "last",
      titlePayload: undefined,
      blockRange: { start: 1, end: 2 },
      height: 50,
    });
  });

  it("顶部间距块可以单独留在上一页，块区间 [0, 0) 不渲染内容块", () => {
    const item = createNode("item", {
      breakPolicy: {
        splittable: true,
        keepTitleWithFirst: false,
      },
    });
    const pages = paginateFlow({
      nodes: [createNode("previous"), item],
      measurements: new Map([
        ["previous", createMeasurement("previous", 40)],
        [
          "item",
          createMeasurement("item", 60, {
            breakPoints: [
              { offset: 0, type: "block", height: 10, blockEnd: 0 },
              { offset: 0, type: "block", height: 40, blockEnd: 1 },
              { offset: 20, type: "paragraph", height: 60 },
            ],
          }),
        ],
      ]),
      availableHeight: 60,
      gap: 0,
    });

    // 上一页只剩 20：内容块（40）放不下，间距块（10）放得下，于是间距单独成片
    expect(pages).toHaveLength(2);
    expect(pages[0]?.items[1]).toMatchObject({
      blockRange: { start: 0, end: 0 },
      height: 10,
    });
    expect(pages[1]?.items[0]).toMatchObject({ blockRange: { start: 0, end: 1 } });
  });

  it("内容盒首块已在前片渲染时，续段才扣除顶部留白", () => {
    const item = createNode("item", {
      breakPolicy: {
        splittable: true,
        keepTitleWithFirst: false,
      },
    });
    const breakPoints = [
      { offset: 0, type: "block" as const, height: 10, blockEnd: 0 },
      { offset: 0, type: "block" as const, height: 60, blockEnd: 1 },
      { offset: 20, type: "paragraph" as const, height: 120 },
    ];

    // 只放下间距块：内容盒首块还没渲染，续段按完整盒顶计算，不扣顶部留白（60 - 10 - 0）
    const onlyGap = paginateFlow({
      nodes: [createNode("previous"), item],
      measurements: new Map([
        ["previous", createMeasurement("previous", 50)],
        [
          "item",
          createMeasurement("item", 60, {
            breakPoints: [
              { offset: 0, type: "block" as const, height: 10, blockEnd: 0 },
              { offset: 0, type: "block" as const, height: 60, blockEnd: 1 },
              { offset: 20, type: "paragraph" as const, height: 60 },
            ],
            droppedTopSpacing: 10,
          }),
        ],
      ]),
      availableHeight: 60,
      gap: 0,
    });
    expect(onlyGap[1]?.items[0]?.height).toBe(50);

    // 放下间距 + 内容块：内容盒已开始，续段扣除顶部留白
    const boxStarted = paginateFlow({
      nodes: [createNode("previous"), item],
      measurements: new Map([
        ["previous", createMeasurement("previous", 30)],
        ["item", createMeasurement("item", 120, { breakPoints, droppedTopSpacing: 10 })],
      ]),
      availableHeight: 95,
      gap: 0,
    });
    expect(boxStarted[1]?.items[0]?.height).toBe(50);
  });

  it("下一个模块换页时，模块间距落在上一页页尾", () => {
    const first = createNode("first", { sourceModuleKey: "alpha" });
    const second = createNode("second", { sourceModuleKey: "beta" });
    const pages = paginateFlow({
      nodes: [first, second],
      measurements: new Map([
        ["first", createMeasurement("first", 40)],
        ["second", createMeasurement("second", 60)],
      ]),
      availableHeight: 70,
      gap: 12,
    });

    expect(pages).toHaveLength(2);
    expect(pages[0]?.trailingGap).toBe(12);
    expect(pages[0]?.usedHeight).toBe(52);
    expect(pages[1]?.items.map((item) => item.nodeId)).toEqual(["second"]);
  });
});
