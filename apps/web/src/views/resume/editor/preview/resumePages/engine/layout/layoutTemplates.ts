import { RESUME_HEIGHT, RESUME_WIDTH } from "../../../constants";
import type { BoxSpacing, PageLayoutConfig, PageSize } from "../pageLayoutTypes";
import { createTwoColumnLayout } from "./createTwoColumnLayout";

/** 模板中可用的页面布局编号。 */
export type PageLayoutTemplateId = "topUserTwoColumn" | "twoColumn";

/** 双栏模板左侧固定展示的模块顺序。 */
const LEFT_MODULE_KEYS = ["account", "education", "skill", "advantage"];
/** 双栏模板右侧固定展示的模块顺序。 */
const RIGHT_MODULE_KEYS = ["work", "project", "honor", "video", "image"];

interface CreatePageLayoutTemplateOptions {
  /** 当前简历实际存在的模块 key。 */
  moduleKeys: string[];
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
}

/** 按固定清单分栏，不按内容高度自动均衡。 */
const splitFixedColumnModules = (moduleKeys: string[]) => {
  const orderedKeys = [...new Set(moduleKeys)].filter((moduleKey) => moduleKey !== "user");
  const leftModuleKeys = orderedKeys.filter((moduleKey) => LEFT_MODULE_KEYS.includes(moduleKey));
  const rightModuleKeys = orderedKeys.filter((moduleKey) => RIGHT_MODULE_KEYS.includes(moduleKey));
  const assignedKeys = new Set([...leftModuleKeys, ...rightModuleKeys]);

  // 未内置的自定义模块按当前简历配置顺序放入右栏，避免模板应用后丢失模块。
  rightModuleKeys.push(...orderedKeys.filter((moduleKey) => !assignedKeys.has(moduleKey)));

  return { leftModuleKeys, rightModuleKeys };
};

/** 创建个人信息顶部通栏、其他模块双栏的布局。 */
const createTopUserTwoColumnLayout = ({
  moduleKeys,
  pageSize,
  pagePadding,
  gap,
  regionGap,
  columnGap,
}: CreatePageLayoutTemplateOptions): PageLayoutConfig => {
  const { leftModuleKeys, rightModuleKeys } = splitFixedColumnModules(moduleKeys);
  if (!moduleKeys.includes("user")) {
    return createTwoColumnLayout({
      pageSize,
      pagePadding,
      leftModuleKeys,
      rightModuleKeys,
      columnGap,
      gap,
      regionGap,
    });
  }

  return {
    pageSize,
    pagePadding,
    regionGap,
    columnGap,
    regions: [
      {
        id: "header",
        order: 0,
        height: { mode: "auto" },
        columns: [
          {
            id: "header-column",
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
            width: { mode: "ratio", value: 1 },
            gap,
            moduleKeys: leftModuleKeys,
          },
          {
            id: "right",
            width: { mode: "ratio", value: 1 },
            gap,
            moduleKeys: rightModuleKeys,
          },
        ],
      },
    ],
  };
};

/** 根据模板编号创建页面布局。 */
export const createPageLayoutTemplate = ({
  templateId,
  ...options
}: CreatePageLayoutTemplateOptions & {
  /** 页面布局模板编号。 */
  templateId: PageLayoutTemplateId;
}): PageLayoutConfig => {
  if (templateId === "topUserTwoColumn") {
    return createTopUserTwoColumnLayout(options);
  }

  const { leftModuleKeys, rightModuleKeys } = splitFixedColumnModules(options.moduleKeys);
  if (options.moduleKeys.includes("user")) {
    leftModuleKeys.unshift("user");
  }

  return createTwoColumnLayout({
    ...options,
    leftModuleKeys,
    rightModuleKeys,
  });
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
  });
