import { describe, expect, it } from "vitest";
import { createResumeLayout } from "./createResumeLayout";
import { resolveColumnWidths } from "./resolveColumnWidths";
import { buildRegionFlows, type ColumnFlowPlan, type RegionFlowBuilder } from "./regionFlows";
import { getContentHeight, RESUME_WIDTH } from "../../../shared/constants";
import type { ColumnConfig } from "../pageLayoutTypes";

/**
 * 简历页几何基线
 *
 * 锁定「布局模板 → 栏宽 → 每页可用高度」三类口径的真实数值，覆盖单栏、双栏、顶部通栏
 * 与正文容器带内边距四种结构。区域留白下沉、两阶段高度结算等几何改动都必须在这里显式体现，
 * 不允许静默改变既有数值。
 */
const MODULE_KEYS = ["user", "account", "education", "skill", "work", "project"];
const PADDING_VERTICAL = 24;
const PADDING_HORIZONTAL = 24;
const MODULE_GAP = 12;
const SHOW_PAGE_NUMBER = true;

/** 区域高度结算的观测量：每栏每页的可用高度与已用高度 */
interface TestFlowPage {
  pageIndex: number;
  usedHeight: number;
  items: unknown[];
  availableHeight?: number;
}

interface CaseDefinition {
  /** 用例名称 */
  name: string;
  /** 简历配置中与布局相关的部分 */
  ui: Record<string, unknown>;
  /** 正文容器的单侧内边距 */
  viewPadding: number;
  /** 当前简历实际存在的模块 key，缺省使用标准模块清单 */
  moduleKeys?: string[];
}

const createCase = (definition: CaseDefinition) => {
  // 纸张边框参与页面内容宽高：取值方式与 useResumeLayout 一致
  const borderWidth = Math.max(0, Number((definition.ui.page as any)?.border?.width) || 0);
  const contentWidth = RESUME_WIDTH - borderWidth * 2 - PADDING_HORIZONTAL * 2;
  const availableHeight = getContentHeight(PADDING_VERTICAL, SHOW_PAGE_NUMBER, borderWidth);
  const layout = createResumeLayout({
    ui: definition.ui,
    moduleKeys: definition.moduleKeys || MODULE_KEYS,
    paddingVertical: PADDING_VERTICAL,
    paddingHorizontal: PADDING_HORIZONTAL,
    gap: MODULE_GAP,
    viewPadding: definition.viewPadding,
  });
  const columnWidths = resolveColumnWidths(layout, contentWidth);
  // 区域分页流回调在引擎里声明为泛型函数类型，基线只需固定一种页面结构，这里显式收窄
  const buildFlow = ((column: ColumnConfig, plan: ColumnFlowPlan): TestFlowPage[] => [
    {
      pageIndex: 0,
      usedHeight: 300,
      items: [{ columnId: column.id, plan }],
      availableHeight: plan.heights.firstPageHeight,
    },
  ]) as unknown as RegionFlowBuilder;
  const { columnFlows } = buildRegionFlows<TestFlowPage>(layout.regions, {
    availableHeight,
    regionGap: layout.regionGap,
    buildFlow,
  });

  return {
    /** 整页可用高度 */
    availableHeight,
    /** 页面内容宽度 */
    contentWidth,
    /** 页面四周留白 */
    pagePadding: layout.pagePadding,
    /** 区域之间与栏之间的间距 */
    spacing: { regionGap: layout.regionGap, columnGap: layout.columnGap },
    /** 区域配置：高度模式、内容内边距与栏内模块顺序 */
    regions: layout.regions.map((region) => ({
      id: region.id,
      height: region.height,
      padding: region.padding ?? null,
      columns: region.columns.map((column) => ({
        id: column.id,
        width: column.width,
        gap: column.gap,
        moduleKeys: column.moduleKeys,
      })),
    })),
    /** 每栏实际像素宽度 */
    columnWidths: [...columnWidths.entries()],
    /** 每栏每页的可用高度与已用高度 */
    columnFlowHeights: [...columnFlows.entries()].map(([columnId, pages]) => [
      columnId,
      pages.map((page) => [page.availableHeight, page.usedHeight]),
    ]),
  };
};

describe("简历页几何基线", () => {
  it("单栏把所有模块放进同一栏，不占用区域高度", () => {
    const snapshot = createCase({ name: "单栏", ui: {}, viewPadding: 0 });

    expect(snapshot).toEqual({
      availableHeight: 1063,
      contentWidth: 746,
      pagePadding: { top: 24, right: 24, bottom: 24, left: 24 },
      spacing: { regionGap: 0, columnGap: 0 },
      regions: [
        {
          id: "main",
          height: { mode: "remaining" },
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          columns: [
            {
              id: "main-column",
              width: { mode: "ratio", value: 1 },
              gap: 12,
              moduleKeys: MODULE_KEYS,
            },
          ],
        },
      ],
      columnWidths: [["main-column", 746]],
      columnFlowHeights: [["main-column", [[1063, 300]]]],
    });
  });

  it("双栏按栏间距均分内容宽度", () => {
    const snapshot = createCase({
      name: "双栏",
      ui: { layout: { type: "twoColumn" } },
      viewPadding: 0,
    });

    expect(snapshot).toEqual({
      availableHeight: 1063,
      contentWidth: 746,
      pagePadding: { top: 24, right: 24, bottom: 24, left: 24 },
      spacing: { regionGap: 12, columnGap: 24 },
      regions: [
        {
          id: "main",
          height: { mode: "remaining" },
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          columns: [
            {
              id: "left",
              width: { mode: "ratio", value: 1 },
              gap: 12,
              moduleKeys: ["user", "account", "skill"],
            },
            {
              id: "right",
              width: { mode: "ratio", value: 1 },
              gap: 12,
              moduleKeys: ["education", "work", "project"],
            },
          ],
        },
      ],
      columnWidths: [
        ["left", 361],
        ["right", 361],
      ],
      columnFlowHeights: [
        ["left", [[1063, 300]]],
        ["right", [[1063, 300]]],
      ],
    });
  });

  it("个人信息顶部通栏时正文扣掉通栏区域与区域间距", () => {
    const snapshot = createCase({
      name: "顶部通栏双栏",
      ui: { layout: { type: "topUserTwoColumn" } },
      viewPadding: 0,
    });

    expect(snapshot).toEqual({
      availableHeight: 1063,
      contentWidth: 746,
      pagePadding: { top: 24, right: 24, bottom: 24, left: 24 },
      spacing: { regionGap: 12, columnGap: 24 },
      regions: [
        {
          id: "user",
          height: { mode: "auto" },
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          columns: [
            {
              id: "user-column",
              width: { mode: "ratio", value: 1 },
              gap: 0,
              moduleKeys: ["user"],
            },
          ],
        },
        {
          id: "main",
          height: { mode: "remaining" },
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          columns: [
            {
              id: "left",
              width: { mode: "ratio", value: 1 },
              gap: 12,
              moduleKeys: ["account", "skill"],
            },
            {
              id: "right",
              width: { mode: "ratio", value: 1 },
              gap: 12,
              moduleKeys: ["education", "work", "project"],
            },
          ],
        },
      ],
      columnWidths: [
        ["user-column", 746],
        ["left", 361],
        ["right", 361],
      ],
      columnFlowHeights: [
        ["user-column", [[1063, 300]]],
        ["left", [[751, 300]]],
        ["right", [[751, 300]]],
      ],
    });
  });

  it("顶部通栏单栏时正文单栏接管剩余高度", () => {
    const snapshot = createCase({
      name: "顶部通栏单栏",
      ui: { layout: { type: "topUserSingleColumn" } },
      viewPadding: 0,
    });

    expect(snapshot).toEqual({
      availableHeight: 1063,
      contentWidth: 746,
      pagePadding: { top: 24, right: 24, bottom: 24, left: 24 },
      spacing: { regionGap: 12, columnGap: 0 },
      regions: [
        {
          id: "user",
          height: { mode: "auto" },
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          columns: [
            {
              id: "user-column",
              width: { mode: "ratio", value: 1 },
              gap: 0,
              moduleKeys: ["user"],
            },
          ],
        },
        {
          id: "main",
          height: { mode: "remaining" },
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          columns: [
            {
              id: "main-column",
              width: { mode: "ratio", value: 1 },
              gap: 12,
              moduleKeys: ["account", "education", "skill", "work", "project"],
            },
          ],
        },
      ],
      columnWidths: [
        ["user-column", 746],
        ["main-column", 746],
      ],
      columnFlowHeights: [
        ["user-column", [[1063, 300]]],
        ["main-column", [[751, 300]]],
      ],
    });
  });

  it("正文容器内边距同时扣栏宽与可用高度", () => {
    const snapshot = createCase({
      name: "正文容器带内边距",
      ui: { layout: { type: "topUserSingleColumn" } },
      viewPadding: 12,
    });

    expect(snapshot).toEqual({
      availableHeight: 1063,
      contentWidth: 746,
      pagePadding: { top: 24, right: 24, bottom: 24, left: 24 },
      spacing: { regionGap: 12, columnGap: 0 },
      regions: [
        {
          id: "user",
          height: { mode: "auto" },
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          columns: [
            {
              id: "user-column",
              width: { mode: "ratio", value: 1 },
              gap: 0,
              moduleKeys: ["user"],
            },
          ],
        },
        {
          id: "main",
          height: { mode: "remaining" },
          padding: { top: 12, right: 12, bottom: 12, left: 12 },
          columns: [
            {
              id: "main-column",
              width: { mode: "ratio", value: 1 },
              gap: 12,
              moduleKeys: ["account", "education", "skill", "work", "project"],
            },
          ],
        },
      ],
      columnWidths: [
        ["user-column", 746],
        ["main-column", 722],
      ],
      columnFlowHeights: [
        ["user-column", [[1063, 300]]],
        ["main-column", [[727, 300]]],
      ],
    });
  });

  it("顶部标语存在时独占最前区域，正文顺延一个区域高度", () => {
    const snapshot = createCase({
      name: "顶部标语单栏",
      ui: { layout: { type: "singleColumn" } },
      viewPadding: 0,
      moduleKeys: ["slogan", ...MODULE_KEYS],
    });

    expect(snapshot).toEqual({
      availableHeight: 1063,
      contentWidth: 746,
      pagePadding: { top: 24, right: 24, bottom: 24, left: 24 },
      spacing: { regionGap: 0, columnGap: 0 },
      regions: [
        {
          id: "slogan",
          height: { mode: "auto" },
          padding: { top: 0, right: 0, bottom: 12, left: 0 },
          columns: [
            {
              id: "slogan-column",
              width: { mode: "ratio", value: 1 },
              gap: 0,
              moduleKeys: ["slogan"],
            },
          ],
        },
        {
          id: "main",
          height: { mode: "remaining" },
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          columns: [
            {
              id: "main-column",
              width: { mode: "ratio", value: 1 },
              gap: 12,
              moduleKeys: MODULE_KEYS,
            },
          ],
        },
      ],
      columnWidths: [
        ["slogan-column", 746],
        ["main-column", 746],
      ],
      columnFlowHeights: [
        ["slogan-column", [[1051, 300]]],
        ["main-column", [[751, 300]]],
      ],
    });
  });

  it("顶部标语与个人信息同时通栏时正文扣掉两个区域与区域间距", () => {
    const snapshot = createCase({
      name: "顶部标语加个人信息通栏",
      ui: { layout: { type: "topUserSingleColumn" } },
      viewPadding: 0,
      moduleKeys: ["slogan", ...MODULE_KEYS],
    });

    expect(snapshot).toEqual({
      availableHeight: 1063,
      contentWidth: 746,
      pagePadding: { top: 24, right: 24, bottom: 24, left: 24 },
      spacing: { regionGap: 12, columnGap: 0 },
      regions: [
        {
          id: "slogan",
          height: { mode: "auto" },
          padding: { top: 0, right: 0, bottom: 12, left: 0 },
          columns: [
            {
              id: "slogan-column",
              width: { mode: "ratio", value: 1 },
              gap: 0,
              moduleKeys: ["slogan"],
            },
          ],
        },
        {
          id: "user",
          height: { mode: "auto" },
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          columns: [
            {
              id: "user-column",
              width: { mode: "ratio", value: 1 },
              gap: 0,
              moduleKeys: ["user"],
            },
          ],
        },
        {
          id: "main",
          height: { mode: "remaining" },
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          columns: [
            {
              id: "main-column",
              width: { mode: "ratio", value: 1 },
              gap: 12,
              moduleKeys: ["account", "education", "skill", "work", "project"],
            },
          ],
        },
      ],
      columnWidths: [
        ["slogan-column", 746],
        ["user-column", 746],
        ["main-column", 746],
      ],
      columnFlowHeights: [
        ["slogan-column", [[1051, 300]]],
        ["user-column", [[739, 300]]],
        ["main-column", [[427, 300]]],
      ],
    });
  });

  it("纸张边框扣掉页面内容宽高", () => {
    const snapshot = createCase({
      name: "纸张边框",
      // 六像素边框：左右共扣十二像素宽，上下共扣十二像素高
      ui: { layout: { type: "singleColumn" }, page: { border: { width: 6 } } },
      viewPadding: 0,
    });

    expect(snapshot.contentWidth).toBe(734);
    expect(snapshot.availableHeight).toBe(1051);
    expect(snapshot.columnWidths).toEqual([["main-column", 734]]);
    expect(snapshot.columnFlowHeights).toEqual([["main-column", [[1051, 300]]]]);
  });

  it("主题声明正文区域留白时按方向覆盖正文容器内边距", () => {
    const snapshot = createCase({
      name: "主题声明正文区域留白",
      ui: {
        layout: { type: "topUserSingleColumn" },
        // 只声明左右留白：上下留白仍沿用正文容器内边距
        region: { main: { padding: { left: 0, right: 0 } } },
      },
      viewPadding: 12,
    });

    expect(snapshot.regions[1]?.padding).toEqual({ top: 12, right: 0, bottom: 12, left: 0 });
    expect(snapshot.columnWidths).toEqual([
      ["user-column", 746],
      ["main-column", 746],
    ]);
    // 可用高度只扣上下留白：1063 − 通栏 300 − 区域间距 12 − 正文上下留白 24
    expect(snapshot.columnFlowHeights[1]).toEqual(["main-column", [[727, 300]]]);
  });
});
