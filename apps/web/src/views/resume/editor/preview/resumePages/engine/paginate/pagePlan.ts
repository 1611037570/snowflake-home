import type { PageLayoutConfig } from "../pageLayoutTypes";
import type { FlowFragmentKind, FlowPage, FlowPageItem } from "./paginateFlow";

/** 分页计划的状态 */
export type PagePlanStatus = "ready" | "invalid" | "overflow";

/** 分页计划中的问题信息 */
export interface LayoutWarning {
  /** 问题类型 */
  code: "missingRegion" | "missingColumn" | "overflow";
  /** 面向开发者的详细说明 */
  message: string;
  /** 产生问题的节点编号 */
  nodeId?: string;
}

/** 页面中的内容分片 */
export interface FragmentPlan {
  /** 当前分片唯一编号 */
  fragmentId: string;
  /** 来源节点编号 */
  sourceNodeId: string;
  /** 来源模块 key，用于定位编辑模块 */
  sourceModuleKey: string;
  /** 当前分片在节点中的位置 */
  fragment: FlowFragmentKind;
  /** 当前分片内容 */
  payload: unknown;
  /** 首次分片对应的标题内容 */
  titlePayload?: unknown;
  /** 当前分片实际使用的高度 */
  height: number;
  /** 当前分片对应的内容范围 */
  contentRange?: {
    start: number;
    end: number;
  };
  /** 由分片位置推导出的视觉装饰类型 */
  decoration: "full" | "top" | "middle" | "bottom";
}

/** 分页计划中的栏 */
export interface ColumnPlan {
  /** 对应布局配置中的栏编号 */
  columnId: string;
  /** 当前栏可用高度 */
  availableHeight: number;
  /** 当前栏已经使用的高度 */
  usedHeight: number;
  /** 当前栏中的内容分片 */
  fragments: FragmentPlan[];
}

/** 分页计划中的区域 */
export interface RegionPlan {
  /** 对应布局配置中的区域编号 */
  regionId: string;
  /** 当前区域已经使用的高度 */
  usedHeight: number;
  /** 当前区域中的栏 */
  columns: ColumnPlan[];
}

/** 分页计划中的页面 */
export interface PagePlanPage {
  /** 页码，从 0 开始 */
  pageIndex: number;
  /** 当前页面中的区域 */
  regions: RegionPlan[];
}

/** 预览、打印和导出共用的分页计划 */
export interface PagePlan {
  /** 当前计划状态 */
  status: PagePlanStatus;
  /** 当前计划版本号 */
  version: number;
  /** 页面列表 */
  pages: PagePlanPage[];
  /** 布局过程中的问题 */
  warnings: LayoutWarning[];
}

/** 根据分片位置推导容器装饰类型 */
const getDecoration = (fragment: FlowFragmentKind): FragmentPlan["decoration"] => {
  if (fragment === "first") return "top";
  if (fragment === "middle") return "middle";
  if (fragment === "last") return "bottom";
  return "full";
};

/** 将单栏分页结果转换为统一 PagePlan */
const toFragmentPlan = (item: FlowPageItem): FragmentPlan => ({
  fragmentId: item.fragmentId,
  sourceNodeId: item.nodeId,
  sourceModuleKey: item.sourceModuleKey,
  fragment: item.fragment,
  payload: item.payload,
  titlePayload: item.titlePayload,
  height: item.height,
  contentRange: item.contentRange,
  decoration: getDecoration(item.fragment),
});

/** 分页计划构建参数 */
export interface BuildPagePlanOptions {
  /** 页面布局配置 */
  layout: PageLayoutConfig;
  /** 单栏分页结果 */
  flowPages: FlowPage[];
  /** 当前栏可用高度 */
  availableHeight: number;
  /** 当前布局版本号 */
  version?: number;
  /** 上游已经发现的问题 */
  warnings?: LayoutWarning[];
}

/**
 * 将分页算法结果放入页面区域和栏位结构。
 * 当前只使用配置中的第一个区域和第一个栏，双栏会在后续阶段接入。
 */
export const buildPagePlan = ({
  layout,
  flowPages,
  availableHeight,
  version = 0,
  warnings = [],
}: BuildPagePlanOptions): PagePlan => {
  const orderedRegions = [...layout.regions].sort((a, b) => a.order - b.order);
  const region = orderedRegions[0];
  if (!region) {
    return {
      status: "invalid",
      version,
      pages: [],
      warnings: [
        ...warnings,
        {
          code: "missingRegion",
          message: "分页计划缺少页面区域配置",
        },
      ],
    };
  }

  const column = region.columns[0];
  if (!column) {
    return {
      status: "invalid",
      version,
      pages: [],
      warnings: [
        ...warnings,
        {
          code: "missingColumn",
          message: `页面区域 ${region.id} 缺少栏位配置`,
        },
      ],
    };
  }

  const safeAvailableHeight = Math.max(0, availableHeight);
  const sourcePages = flowPages.length > 0 ? flowPages : [{ pageIndex: 0, usedHeight: 0, items: [] }];
  const overflowWarnings = sourcePages.flatMap((page) =>
    page.items
      .filter((item) => item.height > safeAvailableHeight)
      .map<LayoutWarning>((item) => ({
        code: "overflow",
        message: `节点 ${item.nodeId} 超出当前栏可用高度`,
        nodeId: item.nodeId,
      })),
  );
  const allWarnings = [...warnings, ...overflowWarnings];

  return {
    status: allWarnings.some((warning) => warning.code === "overflow") ? "overflow" : "ready",
    version,
    pages: sourcePages.map((page) => ({
      pageIndex: page.pageIndex,
      regions: [
        {
          regionId: region.id,
          usedHeight: page.usedHeight,
          columns: [
            {
              columnId: column.id,
              availableHeight: safeAvailableHeight,
              usedHeight: page.usedHeight,
              fragments: page.items.map(toFragmentPlan),
            },
          ],
        },
      ],
    })),
    warnings: allWarnings,
  };
};
