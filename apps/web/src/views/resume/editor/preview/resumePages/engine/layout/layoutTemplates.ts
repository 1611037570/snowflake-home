import { RESUME_HEIGHT, RESUME_WIDTH } from "../../../shared/constants";
import type { BoxSpacing, PageLayoutConfig, PageSize, RegionConfig } from "../pageLayoutTypes";
import { createSingleColumnLayout } from "./createSingleColumnLayout";
import { createTwoColumnLayout, resolveColumnRatios } from "./createTwoColumnLayout";
import type { PageLayoutTemplateId } from "@/views/resume/theme/layouts";

export type { PageLayoutTemplateId } from "@/views/resume/theme/layouts";

/** 双栏布局只保存栏内模块 key 顺序。 */
export interface LayoutColumns {
  left: string[];
  right: string[];
}

/** 双栏模板左侧默认展示的模块顺序，教育经历默认进入右栏。 */
const LEFT_MODULE_KEYS = ["account", "skill", "advantage"];

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
  /** 页面区域之间的垂直间距。 */
  regionGap: number;
  /** 页面栏之间的水平间距。 */
  columnGap: number;
  /** 左栏宽度占比（百分比），缺省时两栏等宽。 */
  leftWidthPercent?: number;
}

/** 按左侧清单分栏：清单内的模块进左栏，其余模块（含未声明的自定义模块）按原顺序全部进右栏 */
const splitFixedColumnModules = (moduleKeys: string[]) => {
  const orderedKeys = [...new Set(moduleKeys)].filter((moduleKey) => moduleKey !== "user");
  const leftModuleKeys = orderedKeys.filter((moduleKey) => LEFT_MODULE_KEYS.includes(moduleKey));
  const rightModuleKeys = orderedKeys.filter((moduleKey) => !LEFT_MODULE_KEYS.includes(moduleKey));

  return { leftModuleKeys, rightModuleKeys };
};

/** 按布局模板生成默认左右栏模块顺序。 */
export const createDefaultLayoutColumns = (
  templateId: PageLayoutTemplateId,
  moduleKeys: string[],
): LayoutColumns => {
  const { leftModuleKeys, rightModuleKeys } = splitFixedColumnModules(moduleKeys);
  if (templateId === "twoColumn" && moduleKeys.includes("user")) {
    leftModuleKeys.unshift("user");
  }
  return { left: leftModuleKeys, right: rightModuleKeys };
};

/** 保留已保存的栏内顺序，并按模板补齐新增模块、移除不存在的模块。 */
export const resolveLayoutColumns = (
  templateId: PageLayoutTemplateId,
  moduleKeys: string[],
  columns?: LayoutColumns | null,
): LayoutColumns => {
  const defaults = createDefaultLayoutColumns(templateId, moduleKeys);
  if (!columns) return defaults;
  const available = new Set(moduleKeys);
  const pinnedModules = templateId === "topUserTwoColumn" ? new Set(["user"]) : new Set<string>();
  const left = [...new Set(columns.left)].filter(
    (key) => available.has(key) && !pinnedModules.has(key),
  );
  const right = [...new Set(columns.right)].filter(
    (key) => available.has(key) && !pinnedModules.has(key) && !left.includes(key),
  );
  const assigned = new Set([...left, ...right]);
  defaults.left.forEach((key) => {
    if (!assigned.has(key)) left.push(key);
  });
  defaults.right.forEach((key) => {
    if (!assigned.has(key)) right.push(key);
  });
  return { left, right };
};

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
    regionGap: 0,
  });

/** 个人信息独占顶部区域，正文保持单栏顺序。 */
const createTopUserSingleColumnLayout = ({
  moduleKeys,
  pageSize,
  pagePadding,
  gap,
  regionGap,
}: CreatePageLayoutTemplateOptions): PageLayoutConfig => {
  if (!moduleKeys.includes("user")) {
    return createSingleColumnLayoutTemplate({
      moduleKeys,
      pageSize,
      pagePadding,
      gap,
      regionGap,
      columnGap: 0,
    });
  }
  return {
    pageSize,
    pagePadding,
    regionGap,
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
  regionGap,
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
      regionGap,
      leftWidthPercent,
    });
  }

  const ratios = resolveColumnRatios(leftWidthPercent);
  return {
    pageSize,
    pagePadding,
    regionGap,
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
 * 只有存在标语模块时才创建该区域，历史简历因此不会多出区域间距与空白；
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
  if (templateId === "singleColumn") {
    return withSloganRegion(createSingleColumnLayoutTemplate(options), options.moduleKeys);
  }
  if (templateId === "topUserSingleColumn") {
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
  regionGap = gap,
  columnGap = 24,
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
  /** 页面区域之间的垂直间距。 */
  regionGap?: number;
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
    regionGap,
    columnGap,
    leftWidthPercent,
    columns,
  });
