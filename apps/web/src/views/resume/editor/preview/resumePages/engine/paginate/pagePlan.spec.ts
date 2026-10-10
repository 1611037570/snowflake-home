import { describe, expect, it } from "vitest";
import { buildPagePlan } from "./pagePlan";
import type { PageLayoutConfig } from "../pageLayoutTypes";

const layout: PageLayoutConfig = {
  pageSize: { width: 794, height: 1123 },
  pagePadding: { top: 24, right: 24, bottom: 24, left: 24 },
  regionGap: 0,
  columnGap: 24,
  regions: [
    {
      id: "main",
      order: 0,
      height: { mode: "remaining" },
      columns: [
        { id: "left", width: { mode: "ratio", value: 1 }, gap: 12, moduleKeys: ["work"] },
        { id: "right", width: { mode: "ratio", value: 1 }, gap: 12, moduleKeys: ["skill"] },
      ],
    },
  ],
};

describe("buildPagePlan", () => {
  it("上游发现内容遗漏时计划无效，不作为正常页面输出", () => {
    const plan = buildPagePlan({
      layout, // 通用布局
      availableHeight: 100, // 栏可用高度
      flowPagesByColumn: new Map(), // 未输出任何片段
      nodes: [{ id: "missing", sourceModuleKey: "work", type: "block", payload: null }], // 应当输出的节点
      measurements: new Map([["missing", { nodeId: "missing", width: 100, fullHeight: 20, breakPoints: [] }]]), // 原始测量
    });
    expect(plan.status).toBe("invalid");
    expect(plan.warnings).toEqual(expect.arrayContaining([expect.objectContaining({ code: "contentMissing", nodeId: "missing" })]));
  });
  it("按栏独立流合并相同页码", () => {
    const plan = buildPagePlan({
      layout,
      availableHeight: 100,
      flowPagesByColumn: new Map([
        ["left", [{ pageIndex: 0, usedHeight: 40, items: [] }]],
        ["right", [{ pageIndex: 0, usedHeight: 70, items: [] }, { pageIndex: 1, usedHeight: 20, items: [] }]],
      ]),
    });

    expect(plan.status).toBe("ready");
    expect(plan.pages).toHaveLength(2);
    expect(plan.pages[0]?.regions[0]?.columns[0]?.usedHeight).toBe(40);
    expect(plan.pages[1]?.regions[0]?.columns[1]?.usedHeight).toBe(20);
  });

  it("缺少栏位时返回无效计划", () => {
    const plan = buildPagePlan({
      layout: { ...layout, regions: [{ ...layout.regions[0]!, columns: [] }] },
      availableHeight: 100,
      flowPagesByColumn: new Map(),
    });

    expect(plan.status).toBe("invalid");
    expect(plan.warnings[0]?.code).toBe("missingColumn");
  });
});
