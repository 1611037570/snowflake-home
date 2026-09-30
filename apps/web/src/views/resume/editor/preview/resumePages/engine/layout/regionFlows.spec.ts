import { describe, expect, it } from "vitest";
import { buildRegionFlows, type ColumnFlowPlan } from "./regionFlows";
import { getRegionContentHeight, getRegionPaddingHeight } from "./flowHeights";
import type { RegionConfig } from "../pageLayoutTypes";

/** 构造一个区域配置，只保留区域高度循环关心的字段 */
const createRegion = (overrides: Partial<RegionConfig> & { id: string }): RegionConfig => ({
  order: 0,
  height: { mode: "remaining" },
  columns: [
    {
      id: `${overrides.id}-column`,
      width: { mode: "ratio", value: 1 },
      gap: 0,
      moduleKeys: [],
    },
  ],
  ...overrides,
});

/** 构造分页流页面，用于驱动区域高度结算 */
const createFlowPage = (usedHeight: number, itemCount: number) => ({
  usedHeight,
  items: Array.from({ length: itemCount }, (_, index) => ({ index })),
});

/** 记录每次 buildFlow 收到的每栏高度计划 */
const createHeightSpy = (
  build: (
    columnId: string,
    plan: ColumnFlowPlan,
  ) => Array<{ usedHeight: number; items: unknown[]; availableHeight?: number }>,
) => {
  const plans: ColumnFlowPlan[] = [];
  const buildFlow = (column: { id: string }, plan: ColumnFlowPlan) => {
    plans.push(plan);
    return build(column.id, plan);
  };
  return { plans, buildFlow };
};

describe("flowHeights", () => {
  it("固定高度区域按配置高度取内容高度，其余模式取整页可用高度", () => {
    const fixed = createRegion({ id: "header", height: { mode: "fixed", value: 500 } });
    const remaining = createRegion({ id: "main", height: { mode: "remaining" } });
    const auto = createRegion({ id: "footer", height: { mode: "auto" } });

    expect(getRegionContentHeight(fixed, 400)).toBe(500);
    expect(getRegionContentHeight(remaining, 400)).toBe(400);
    expect(getRegionContentHeight(auto, 400)).toBe(400);
  });

  it("区域内容内边距按上下两侧合计", () => {
    const region = createRegion({
      id: "main",
      contentPadding: { top: 12, right: 8, bottom: 18, left: 8 },
    });

    expect(getRegionPaddingHeight(region)).toBe(30);
    expect(getRegionPaddingHeight(createRegion({ id: "plain" }))).toBe(0);
  });
});

describe("buildRegionFlows", () => {
  it("空的自适应区域不占用首页高度，后续区域拿到整页可用高度", () => {
    const { plans, buildFlow } = createHeightSpy(() => [createFlowPage(0, 0)]);

    buildRegionFlows(
      [
        createRegion({ id: "header", height: { mode: "auto" } }),
        createRegion({ id: "main", height: { mode: "remaining" } }),
      ],
      { availableHeight: 400, regionGap: 0, buildFlow },
    );

    // 空区域按 0 占用结算，正文区域首页可用高度不被扣减
    expect(plans[1]?.heights.firstPageHeight).toBe(400);
  });

  it("自适应区域的首页高度与内容内边距、区域间距一起从后续区域扣减", () => {
    const { plans, buildFlow } = createHeightSpy((columnId) =>
      columnId === "header-column"
        ? [createFlowPage(60, 1), createFlowPage(20, 1)]
        : [createFlowPage(0, 0)],
    );

    buildRegionFlows(
      [
        createRegion({
          id: "header",
          height: { mode: "auto" },
          contentPadding: { top: 12, right: 12, bottom: 12, left: 12 },
        }),
        createRegion({ id: "main", height: { mode: "remaining" } }),
      ],
      { availableHeight: 400, regionGap: 10, buildFlow },
    );

    // 首页占用 60（区域首页高度）+ 24（内容内边距）+ 10（区域间距）= 94，正文区域首页可用 306
    expect(plans[1]?.heights.firstPageHeight).toBe(306);
    // 自适应区域的后续页面只扣自身内容内边距：400 - 24 = 376
    expect(plans[0]?.heights.laterPageHeight).toBe(376);
  });

  it("固定高度区域按配置高度占用首页，正文区域不再分到首页高度", () => {
    const { plans, buildFlow } = createHeightSpy(() => [createFlowPage(0, 0)]);

    buildRegionFlows(
      [
        createRegion({ id: "header", height: { mode: "fixed", value: 500 } }),
        createRegion({ id: "main", height: { mode: "remaining" } }),
      ],
      { availableHeight: 400, regionGap: 0, buildFlow },
    );

    // 首屏高度已被固定区域占满，正文区域首页可用高度为 0 且不会为负
    expect(plans[1]?.heights.firstPageHeight).toBe(0);
  });

  it("剩余高度区域之后的区域首页可用高度为零", () => {
    const { plans, buildFlow } = createHeightSpy(() => [createFlowPage(0, 0)]);

    buildRegionFlows(
      [
        createRegion({ id: "main", height: { mode: "remaining" } }),
        createRegion({ id: "footer", height: { mode: "auto" } }),
      ],
      { availableHeight: 400, regionGap: 0, buildFlow },
    );

    // 剩余高度区域独占首屏：它自己的首页可用高度是整页，后续区域被扣到 0
    expect(plans[0]?.heights.firstPageHeight).toBe(400);
    expect(plans[1]?.heights.firstPageHeight).toBe(0);
  });

  it("每个栏独立生成分页流并按栏编号登记", () => {
    const region = createRegion({
      id: "main",
      columns: [
        { id: "left", width: { mode: "ratio", value: 1 }, gap: 12, moduleKeys: ["work"] },
        { id: "right", width: { mode: "ratio", value: 1 }, gap: 12, moduleKeys: ["skill"] },
      ],
    });
    const { columnFlows } = buildRegionFlows([region], {
      availableHeight: 300,
      regionGap: 0,
      buildFlow: (column) => [createFlowPage(column.id === "left" ? 120 : 200, 1)],
    });

    expect([...columnFlows.keys()]).toEqual(["left", "right"]);
    // 区域高度取各栏首页占用的最大值，栏之间的差异不影响区域结算
    expect(columnFlows.get("left")?.[0]?.usedHeight).toBe(120);
    expect(columnFlows.get("right")?.[0]?.usedHeight).toBe(200);
  });
});
