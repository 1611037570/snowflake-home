import { describe, expect, it } from "vitest";
import { buildRegionFlows, type RegionFlowPage } from "./regionFlows";
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

/** 构造一页分页流结果 */
const createFlowPage = (
  pageIndex: number,
  usedHeight: number,
  itemCount: number,
): RegionFlowPage => ({
  pageIndex,
  usedHeight,
  items: Array.from({ length: itemCount }, (_, index) => ({ index })),
});

describe("buildRegionFlows", () => {
  it("空的自适应区域不占用首屏高度，后续区域拿到整页可用高度", () => {
    const { columnFlows } = buildRegionFlows<RegionFlowPage>(
      [
        createRegion({ id: "header", height: { mode: "auto" } }),
        createRegion({ id: "main", height: { mode: "remaining" } }),
      ],
      {
        availableHeight: 400,
        regionGap: 0,
        buildFlow: (_column, { availableHeight }) => [
          { ...createFlowPage(0, 0, 0), availableHeight },
        ],
      },
    );

    // 空的自适应区域按 0 高度结算，剩余高度区域前面没有被占用时拿到整页可用高度
    expect(columnFlows.get("main-column")?.[0]?.availableHeight).toBe(400);
  });

  it("自适应区域的非零首屏高度与内容内边距一起从后续区域扣减", () => {
    const { firstPageConsumedHeight, columnFlows } = buildRegionFlows<RegionFlowPage>(
      [
        createRegion({
          id: "header",
          height: { mode: "auto" },
          contentPadding: { top: 12, right: 12, bottom: 12, left: 12 },
        }),
        createRegion({ id: "main", height: { mode: "remaining" } }),
      ],
      {
        availableHeight: 400,
        regionGap: 10,
        buildFlow: (column, { availableHeight, availableHeightByPage }) =>
          column.id === "header-column"
            ? [
                { ...createFlowPage(0, 60, 1), availableHeight },
                { ...createFlowPage(1, 20, 1), availableHeight: availableHeightByPage(1) },
              ]
            : [{ ...createFlowPage(0, 0, 0), availableHeight }],
      },
    );

    // 自适应区域按首屏实际占用结算：60（首屏高度）+ 24（内容内边距）+ 10（区域间距）= 94
    // 正文区域首页可用高度为 400 - 94 - 0 = 306
    expect(columnFlows.get("main-column")?.[0]?.availableHeight).toBe(306);
    // 自适应区域的后续页面只扣自身内容内边距，不扣首屏占用：400 - 24 = 376
    expect(columnFlows.get("header-column")?.[1]?.availableHeight).toBe(376);
  });

  it("固定高度区域按配置高度结算，正文区域不再分到首屏高度", () => {
    const { firstPageConsumedHeight, columnFlows } = buildRegionFlows<RegionFlowPage>(
      [
        createRegion({
          id: "header",
          height: { mode: "fixed", value: 500 },
        }),
        createRegion({ id: "main", height: { mode: "remaining" } }),
      ],
      {
        availableHeight: 400,
        regionGap: 0,
        buildFlow: (_column, { availableHeight }) => [
          { ...createFlowPage(0, 0, 0), availableHeight },
        ],
      },
    );

    // 首屏高度已被固定区域占满，正文区域首页只能拿到 0
    expect(columnFlows.get("main-column")?.[0]?.availableHeight).toBe(0);
  });

  it("固定高度区域超出整页可用高度时不截断，按配置高度结算", () => {
    const { firstPageConsumedHeight, columnFlows } = buildRegionFlows<RegionFlowPage>(
      [
        createRegion({ id: "header", height: { mode: "fixed", value: 500 } }),
        createRegion({ id: "footer", height: { mode: "auto" } }),
      ],
      {
        availableHeight: 400,
        regionGap: 0,
        buildFlow: (_column, { availableHeight }) => [
          { ...createFlowPage(0, 0, 0), availableHeight },
        ],
      },
    );

    expect(firstPageConsumedHeight).toBe(500);
    // 剩余高度被固定区域与区域间距扣完后不再补足，后续区域首页可用高度不会为负
    expect(columnFlows.get("footer-column")?.[0]?.availableHeight).toBe(0);
  });

  it("剩余高度区域独占首屏，其后的区域首页可用高度为零", () => {
    const { firstPageConsumedHeight, columnFlows } = buildRegionFlows<RegionFlowPage>(
      [
        createRegion({ id: "main", height: { mode: "remaining" } }),
        createRegion({ id: "footer", height: { mode: "auto" } }),
      ],
      {
        availableHeight: 400,
        regionGap: 0,
        buildFlow: (_column, { availableHeight }) => [
          { ...createFlowPage(0, 0, 0), availableHeight },
        ],
      },
    );

    expect(firstPageConsumedHeight).toBe(400);
    expect(columnFlows.get("footer-column")?.[0]?.availableHeight).toBe(0);
  });

  it("每个栏独立生成分页流并按栏编号登记", () => {
    const region = createRegion({
      id: "main",
      columns: [
        { id: "left", width: { mode: "ratio", value: 1 }, gap: 12, moduleKeys: ["work"] },
        { id: "right", width: { mode: "ratio", value: 1 }, gap: 12, moduleKeys: ["skill"] },
      ],
    });
    const { columnFlows } = buildRegionFlows<RegionFlowPage>([region], {
      availableHeight: 300,
      regionGap: 0,
      buildFlow: (column, { availableHeight }) => [
        { ...createFlowPage(0, column.id === "left" ? 120 : 200, 1), availableHeight },
      ],
    });

    expect([...columnFlows.keys()]).toEqual(["left", "right"]);
    // 区域高度取各栏首屏占用的最大值，栏之间的差异不影响区域结算
    expect(columnFlows.get("left")?.[0]?.usedHeight).toBe(120);
    expect(columnFlows.get("right")?.[0]?.usedHeight).toBe(200);
  });
});
