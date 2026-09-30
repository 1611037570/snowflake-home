import { describe, expect, it } from "vitest";
import { paginateFlow } from "./paginateFlow";
import type { MeasuredNode } from "../measure/types";
import type { LayoutNode } from "../types";

const createNode = (id: string, overrides: Partial<LayoutNode> = {}): LayoutNode => ({
  id,
  sourceModuleKey: "test",
  type: "block",
  breakPolicy: {
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

  it("内容超出可用高度时标题与条目头留在当前页，正文顺延下一页", () => {
    const title = createNode("module.title", { type: "title", payload: { moduleKey: "module" } });
    const item = createNode("item", {
      type: "group",
      breakPolicy: {
      },
    });
    const measurements = new Map([
      ["first", createMeasurement("first", 30)],
      ["module.title", createMeasurement("module.title", 30)],
      [
        "item",
        createMeasurement("item", 200, {
          breakPoints: [
            { offset: 0, type: "paragraph", height: 100 },
            { offset: 5, type: "paragraph", height: 150 },
            { offset: 10, type: "paragraph", height: 200 },
          ],
        }),
      ],
    ]);

    const pages = paginateFlow({
      nodes: [createNode("first"), title, item],
      measurements,
      availableHeight: 150,
      gap: 0,
    });

    // 第一页只放得下标题，条目从第二页开始并按可用高度切片，正文续段到第三页
    expect(pages).toHaveLength(3);
    expect(pages[0]?.items.map((flowItem) => [flowItem.nodeId, flowItem.fragment])).toEqual([
      ["first", "single"],
      ["module.title", "single"],
    ]);
    expect(pages[0]?.usedHeight).toBe(60);
    expect(pages[1]?.items[0]).toMatchObject({ fragment: "first", height: 150 });
    expect(pages[2]?.items[0]).toMatchObject({ fragment: "last", height: 50 });
  });

  it("标题作为独立节点只出现一次，内容续段不重复标题", () => {
    const title = createNode("module.title", { type: "title", payload: { moduleKey: "module" } });
    const content = createNode("content", {
      type: "richText",
      breakPolicy: {
      },
    });
    const measurements = new Map([
      ["module.title", createMeasurement("module.title", 20)],
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
      nodes: [title, content],
      measurements,
      availableHeight: 70,
      gap: 0,
    });

    // 标题单独一片，内容从续段接着排，两页都不重复标题
    expect(pages).toHaveLength(2);
    expect(pages[0]?.items[0]).toMatchObject({ nodeId: "module.title", fragment: "single" });
    expect(pages[0]?.items[1]).toMatchObject({
      fragment: "first",
      contentRange: { start: 0, end: 5 },
    });
    expect(pages[1]?.items[0]).toMatchObject({
      fragment: "last",
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
      type: "title",
      payload: { moduleKey: "video" },
    });
    const content = createNode("video.media-0", {
      sourceModuleKey: "video",
      type: "media",
      breakPolicy: {
      },
    });
    const pages = paginateFlow({
      nodes: [
        createNode("video.previous", { sourceModuleKey: "video" }),
        title,
        content,
      ],
      measurements: new Map([
        ["video.previous", createMeasurement("video.previous", 50)],
        ["video.title", createMeasurement("video.title", 10)],
        ["video.media-0", createMeasurement("video.media-0", 40)],
      ]),
      availableHeight: 100,
      gap: 10,
    });

    // 同一模块的三个节点都在同一页，标题与内容之间不加入模块间距
    expect(pages).toHaveLength(1);
    expect(pages[0]?.items.map((item) => item.fragment)).toEqual([
      "single",
      "single",
      "single",
    ]);
    expect(pages[0]?.usedHeight).toBe(100);
  });

  it("当前页放得下媒体条目的首个内容块时不整条顺延", () => {
    const title = createNode("video.title", {
      sourceModuleKey: "video",
      type: "title",
      payload: { moduleKey: "video" },
    });
    const content = createNode("video.media-0", {
      sourceModuleKey: "video",
      type: "media",
      breakPolicy: {
      },
    });
    const pages = paginateFlow({
      nodes: [title, content],
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

    // 标题先占一页，内容块接着占满该页，剩余块顺延下一页
    expect(pages).toHaveLength(2);
    expect(pages[0]?.items[0]).toMatchObject({ fragment: "single", height: 20 });
    expect(pages[0]?.items[1]).toMatchObject({
      fragment: "first",
      blockRange: { start: 0, end: 1 },
      height: 40,
    });
    expect(pages[0]?.usedHeight).toBe(60);
    expect(pages[1]?.items[0]).toMatchObject({
      fragment: "last",
      blockRange: { start: 1, end: 2 },
      height: 50,
    });
  });

  it("间距块不单独成片，放不下时与内容一起顺延下一页", () => {
    const item = createNode("item", {
      breakPolicy: {
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

    // 上一页只剩 20：间距是普通内容，不单独成片，整条与间距一起顺延到下一页后完整放下
    expect(pages).toHaveLength(2);
    expect(pages[0]?.items).toHaveLength(1);
    expect(pages[0]?.usedHeight).toBe(40);
    expect(pages[1]?.items[0]).toMatchObject({
      fragment: "single",
      height: 60,
      blockRange: { start: 0, end: 1 },
    });
  });

  it("内容盒首块已在前片渲染时，续段才扣除顶部留白", () => {
    const item = createNode("item", {
      breakPolicy: {
      },
    });
    const breakPoints = [
      { offset: 0, type: "block" as const, height: 10, blockEnd: 0 },
      { offset: 0, type: "block" as const, height: 60, blockEnd: 1 },
      { offset: 20, type: "paragraph" as const, height: 120 },
    ];

    // 上一页只放了前一个节点，内容盒首块没有渲染过：整条按完整盒顶计算，不扣顶部留白
    const boxNotStarted = paginateFlow({
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
    expect(boxNotStarted[1]?.items[0]?.height).toBe(60);

    // 内容盒首块已在前片渲染：续段扣除顶部留白
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

  it("段落间距落在页首时不占高度，内容按去掉间距后的高度分页", () => {
    // 间距与内容是两个独立节点：间距放不下的页，内容按自身高度分页
    const previous = createNode("previous", { sourceModuleKey: "alpha" });
    const spacer = createNode("item.paragraph-spacing", {
      type: "spacer",
      hideWhenPageLeading: true,
      payload: { height: 10 },
    });
    const content = createNode("item", { type: "block" });
    const pages = paginateFlow({
      nodes: [previous, spacer, content],
      measurements: new Map([
        ["previous", createMeasurement("previous", 40)],
        // 间距节点渲染成普通 div，测量结果里没有块区间与断点
        ["item.paragraph-spacing", createMeasurement("item.paragraph-spacing", 10)],
        ["item", createMeasurement("item", 50)],
      ]),
      availableHeight: 50,
      gap: 0,
    });

    // 间距正好填满当前页剩余空间，于是留在这一页，内容顺延下一页
    expect(pages).toHaveLength(2);
    expect(pages[0]?.items.map((item) => item.nodeId)).toEqual([
      "previous",
      "item.paragraph-spacing",
    ]);
    expect(pages[1]?.items.map((item) => item.nodeId)).toEqual(["item"]);
    expect(pages[1]?.usedHeight).toBe(50);

    // 间距自己放不下时与内容一起顺延：它成为新页第一项，不占高度，内容按自身高度完整放下
    const shifted = paginateFlow({
      nodes: [previous, spacer, content],
      measurements: new Map([
        ["previous", createMeasurement("previous", 45)],
        ["item.paragraph-spacing", createMeasurement("item.paragraph-spacing", 10)],
        ["item", createMeasurement("item", 50)],
      ]),
      availableHeight: 50,
      gap: 0,
    });
    expect(shifted).toHaveLength(2);
    expect(shifted[1]?.items.map((item) => item.nodeId)).toEqual([
      "item.paragraph-spacing",
      "item",
    ]);
    expect(shifted[1]?.usedHeight).toBe(50);
  });

  it("空页始终放不下内容时不会无限换页", () => {
    // 断点高度都不超过已消费高度、整片又放不下时，每次只能换页而无法消费内容；
    // 该用例在缺少换页上限时会一直换页直到内存耗尽
    const item = createNode("item", {
      breakPolicy: {
      },
    });
    const pages = paginateFlow({
      nodes: [item],
      measurements: new Map([
        [
          "item",
          createMeasurement("item", 70, {
            breakPoints: [
              { offset: 0, type: "block", height: 40, heightAtPageStart: 40, blockEnd: 1 },
              { offset: 0, type: "block", height: 60, heightAtPageStart: 60, blockEnd: 2 },
            ],
          }),
        ],
      ]),
      availableHeight: 50,
      gap: 0,
    });

    // 换页次数受上限约束：分页必须结束，且页数保持在换页上限附近而不是无限换页
    expect(pages.length).toBeLessThanOrEqual(4);
    expect(pages.length).toBeGreaterThan(0);
  });
});
