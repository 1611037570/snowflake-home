import { RESUME_HEIGHT, RESUME_WIDTH } from "../../../shared/constants";
import type { BoxSpacing, PageLayoutConfig, PageSize, RegionConfig } from "../pageLayoutTypes";
import { createSingleColumnLayout } from "./createSingleColumnLayout";
import { createTwoColumnLayout, resolveColumnRatios } from "./createTwoColumnLayout";
import {
  defaultColumnGap,
  resolveLayoutColumns,
  type LayoutColumns,
  type PageLayoutTemplateId,
} from "@/views/resume/theme/layouts";

export type { PageLayoutTemplateId } from "@/views/resume/theme/layouts";

interface CreatePageLayoutTemplateOptions {
  /** 当前简历实际存在的模块 key。 */
  moduleKeys: string[];
  /** 双栏栏内模块顺序；未提供时按模板规则生成。 */
  columns?: LayoutColumns | null;
  /** 页面尺寸。 */
  pageSize: PageSize;
  /** 页面内边距。 */
  pagePadding: BoxSpacing;
  /** 模块之间的垂直间距。 */
  gap: number;
  /** 页面栏之间的水平间距。 */
  columnGap: number;
  /** 左栏宽度占比（百分比），缺省时两栏等宽。 */
  leftWidthPercent?: number;
}

/** 创建单栏布局：所有模块按简历顺序进入同一栏。 */
const createSingleColumnLayoutTemplate = ({
  moduleKeys,
  pageSize,
  pagePadding,
  gap,
}: CreatePageLayoutTemplateOptions): PageLayoutConfig =>
  createSingleColumnLayout({
    moduleKeys,
    pageSize,
    pagePadding,
    gap,
    columnGap: 0,
  });

/** 个人信息独占顶部区域，正文保持单栏顺序。 */
const createTopUserSingleColumnLayout = ({
  moduleKeys,
  pageSize,
  pagePadding,
  gap,
}: CreatePageLayoutTemplateOptions): PageLayoutConfig => {
  if (!moduleKeys.includes("user")) {
    return createSingleColumnLayoutTemplate({
      moduleKeys,
      pageSize,
      pagePadding,
      gap,
      columnGap: 0,
    });
  }
  return {
    pageSize,
    pagePadding,
    columnGap: 0,
    regions: [
      {
        id: "user",
        order: 0,
        height: { mode: "auto" },
        columns: [
          { id: "user-column", width: { mode: "ratio", value: 1 }, gap: 0, moduleKeys: ["user"] },
        ],
      },
      {
        id: "main",
        order: 1,
        height: { mode: "remaining" },
        columns: [
          {
            id: "main-column",
            width: { mode: "ratio", value: 1 },
            gap,
            moduleKeys: moduleKeys.filter((key) => key !== "user"),
          },
        ],
      },
    ],
  };
};

/** 创建个人信息顶部通栏、其他模块双栏的布局。 */
const createTopUserTwoColumnLayout = ({
  moduleKeys,
  columns,
  pageSize,
  pagePadding,
  gap,
  columnGap,
  leftWidthPercent,
}: CreatePageLayoutTemplateOptions): PageLayoutConfig => {
  const { left: leftModuleKeys, right: rightModuleKeys } = resolveLayoutColumns(
    "topUserTwoColumn",
    moduleKeys,
    columns,
  );
  if (!moduleKeys.includes("user")) {
    return createTwoColumnLayout({
      pageSize,
      pagePadding,
      leftModuleKeys,
      rightModuleKeys,
      columnGap,
      gap,
      leftWidthPercent,
    });
  }

  const ratios = resolveColumnRatios(leftWidthPercent);
  return {
    pageSize,
    pagePadding,
    columnGap,
    regions: [
      {
        id: "user",
        order: 0,
        height: { mode: "auto" },
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
        order: 1,
        height: { mode: "remaining" },
        columns: [
          {
            id: "left",
            width: { mode: "ratio", value: ratios.left },
            gap,
            moduleKeys: leftModuleKeys,
          },
          {
            id: "right",
            width: { mode: "ratio", value: ratios.right },
            gap,
            moduleKeys: rightModuleKeys,
          },
        ],
      },
    ],
  };
};

/** 顶部标语独占页面最前区域，只出现在首页 */
const createSloganRegion = (): RegionConfig => ({
  id: "slogan",
  widthMode: "page", // 纸张全宽属于区域几何，栏宽解析不再识别业务名称
  order: 0,
  height: { mode: "auto" },
  columns: [
    {
      id: "slogan-column",
      width: { mode: "ratio", value: 1 },
      gap: 0,
      moduleKeys: ["slogan"],
    },
  ],
});

/**
 * 把顶部标语区域插到所有区域之前。
 * 只有存在标语模块时才创建该区域，避免多出区域间距与空白；
 * 同时把标语从模板原有栏位中摘掉，保证每个模块只被分配一次。区域顺序在此重新编号。
 */
const withSloganRegion = (layout: PageLayoutConfig, moduleKeys: string[]): PageLayoutConfig => {
  if (!moduleKeys.includes("slogan")) return layout;
  const regions: RegionConfig[] = [
    createSloganRegion(),
    ...layout.regions.map((region) => ({
      ...region,
      columns: region.columns.map((column) => ({
        ...column,
        moduleKeys: column.moduleKeys.filter((moduleKey) => moduleKey !== "slogan"),
      })),
    })),
  ];
  return {
    ...layout,
    regions: regions.map((region, index) => ({ ...region, order: index })),
  };
};

/** 根据模板编号创建页面布局。 */
export const createPageLayoutTemplate = ({
  templateId,
  columns,
  ...options
}: CreatePageLayoutTemplateOptions & {
  /** 页面布局模板编号。 */
  templateId: PageLayoutTemplateId;
}): PageLayoutConfig => {
  // 个人信息默认独立成区：单栏的两种布局共用同一区域结构，只有左右布局把它分进栏位时才是栏内模块
  if (templateId === "singleColumn" || templateId === "topUserSingleColumn") {
    return withSloganRegion(createTopUserSingleColumnLayout(options), options.moduleKeys);
  }
  if (templateId === "topUserTwoColumn") {
    return withSloganRegion(
      createTopUserTwoColumnLayout({ ...options, columns }),
      options.moduleKeys,
    );
  }

  const { left: leftModuleKeys, right: rightModuleKeys } = resolveLayoutColumns(
    "twoColumn",
    options.moduleKeys,
    columns,
  );

  return withSloganRegion(
    createTwoColumnLayout({
      ...options,
      leftModuleKeys,
      rightModuleKeys,
    }),
    options.moduleKeys,
  );
};

/** 使用当前主题参数创建布局模板。 */
export const createDefaultPageLayoutTemplate = ({
  templateId,
  moduleKeys,
  paddingVertical,
  paddingHorizontal,
  gap,
  columnGap = defaultColumnGap,
  leftWidthPercent,
  columns,
}: {
  /** 页面布局模板编号。 */
  templateId: PageLayoutTemplateId;
  /** 当前简历实际存在的模块 key。 */
  moduleKeys: string[];
  /** 页面上下内边距。 */
  paddingVertical: number;
  /** 页面左右内边距。 */
  paddingHorizontal: number;
  /** 模块之间的垂直间距。 */
  gap: number;
  /** 页面栏之间的水平间距。 */
  columnGap?: number;
  /** 左栏宽度占比（百分比）。 */
  leftWidthPercent?: number;
  /** 双栏栏内模块顺序。 */
  columns?: LayoutColumns | null;
}) =>
  createPageLayoutTemplate({
    templateId,
    moduleKeys,
    pageSize: { width: RESUME_WIDTH, height: RESUME_HEIGHT },
    pagePadding: {
      top: paddingVertical,
      right: paddingHorizontal,
      bottom: paddingVertical,
      left: paddingHorizontal,
    },
    gap,
    columnGap,
    leftWidthPercent,
    columns,
  });
