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
});
