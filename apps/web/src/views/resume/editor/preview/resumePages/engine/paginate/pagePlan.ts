import type { PageLayoutConfig, RegionConfig } from "../pageLayoutTypes";
import type { FlowFragmentKind, FlowPage, FlowPageItem } from "./paginateFlow";

/** 分页计划的状态。 */
export type PagePlanStatus = "ready" | "invalid" | "overflow";

/** 分页布局过程中的问题。 */
export interface LayoutWarning {
  /** 问题类型。 */
  code: "missingRegion" | "missingColumn" | "overflow" | "invalidLayout";
  /** 面向开发者的详细说明。 */
  message: string;
  /** 产生问题的节点编号。 */
  nodeId?: string;
}

/** 页面中的内容分片。 */
export interface FragmentPlan {
  /** 当前分片唯一编号。 */
  fragmentId: string;
  /** 来源节点编号。 */
  sourceNodeId: string;
  /** 来源模块 key。 */
  sourceModuleKey: string;
  /** 当前分片在节点中的位置。 */
  fragment: FlowFragmentKind;
  /** 当前分片内容。 */
  payload: unknown;
  /** 首次分片对应的标题内容。 */
  titlePayload?: unknown;
  /** 当前分片实际使用的高度。 */
  height: number;
  /** 当前分片对应的内容范围。 */
  contentRange?: { start: number; end: number };
  /** 由分片位置推导出的视觉装饰类型。 */
  decoration: "full" | "top" | "middle" | "bottom";
}

/** 分页计划中的栏。 */
export interface ColumnPlan {
  /** 对应布局配置中的栏编号。 */
  columnId: string;
  /** 当前栏可用高度。 */
  availableHeight: number;
  /** 当前栏已经使用的高度。 */
  usedHeight: number;
  /** 当前栏中的内容分片。 */
  fragments: FragmentPlan[];
}

/** 分页计划中的区域。 */
export interface RegionPlan {
  /** 对应布局配置中的区域编号。 */
  regionId: string;
  /** 当前区域已经使用的高度。 */
  usedHeight: number;
  /** 当前区域中的栏。 */
  columns: ColumnPlan[];
}

/** 页面计划中的单页。 */
export interface PagePlanPage {
  /** 页码，从零开始。 */
  pageIndex: number;
  /** 当前页面中的区域。 */
  regions: RegionPlan[];
}

/** 预览、打印和导出共用的分页计划。 */
export interface PagePlan {
  /** 当前计划状态。 */
  status: PagePlanStatus;
  /** 当前计划版本号。 */
  version: number;
  /** 页面列表。 */
  pages: PagePlanPage[];
  /** 布局过程中的问题。 */
  warnings: LayoutWarning[];
}

const getDecoration = (fragment: FlowFragmentKind): FragmentPlan["decoration"] => {
  if (fragment === "first") return "top";
  if (fragment === "middle") return "middle";
  if (fragment === "last") return "bottom";
  return "full";
};

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

/** 根据区域配置推导当前区域可使用的高度。 */
const getRegionHeight = (region: RegionConfig, fallback: number) => {
  if (region.height.mode === "fixed") return Math.max(0, region.height.value);
  return Math.max(0, fallback);
};

/** 页面计划构建参数。 */
export interface BuildPagePlanOptions {
  /** 页面布局配置。 */
  layout: PageLayoutConfig;
  /** 单栏兼容输入；配置多栏时应使用 flowPagesByColumn。 */
  flowPages?: FlowPage[];
  /** 每个栏独立生成的分页流。 */
  flowPagesByColumn?: ReadonlyMap<string, FlowPage[]>;
  /** 单栏兼容高度。 */
  availableHeight: number;
  /** 每个栏的可用高度。 */
  availableHeightByColumn?: ReadonlyMap<string, number>;
  /** 当前布局版本号。 */
  version?: number;
  /** 上游已经发现的问题。 */
  warnings?: LayoutWarning[];
}

const emptyFlowPage = (pageIndex: number): FlowPage => ({
  pageIndex,
  usedHeight: 0,
  items: [],
});

/** 将每个栏的独立分页流合并为统一的 PagePlan。 */
export const buildPagePlan = ({
  layout,
  flowPages = [],
  flowPagesByColumn,
  availableHeight,
  availableHeightByColumn,
  version = 0,
  warnings = [],
}: BuildPagePlanOptions): PagePlan => {
  const orderedRegions = [...layout.regions].sort((a, b) => a.order - b.order);
  if (orderedRegions.length === 0) {
    return {
      status: "invalid",
      version,
      pages: [],
      warnings: [...warnings, { code: "missingRegion", message: "分页计划缺少页面区域配置" }],
    };
  }
  const missingColumnWarnings = orderedRegions
    .filter((region) => region.columns.length === 0)
    .map<LayoutWarning>((region) => ({
      code: "missingColumn",
      message: `页面区域 ${region.id} 缺少栏位配置`,
    }));
  if (missingColumnWarnings.length > 0) {
    return {
      status: "invalid",
      version,
      pages: [],
      warnings: [...warnings, ...missingColumnWarnings],
    };
  }

  const getFlowPages = (columnId: string) =>
    flowPagesByColumn?.get(columnId) || (flowPages.length > 0 ? flowPages : [emptyFlowPage(0)]);
  const allColumnPages = orderedRegions.flatMap((region) =>
    region.columns.map((column) => getFlowPages(column.id)),
  );
  const pageCount = Math.max(1, ...allColumnPages.map((pages) => pages.length));
  const overflowWarnings = orderedRegions.flatMap((region) =>
    region.columns.flatMap((column) => {
      const columnHeight = Math.max(
        0,
        availableHeightByColumn?.get(column.id) ?? getRegionHeight(region, availableHeight),
      );
      return getFlowPages(column.id).flatMap((page) =>
        page.items
          .filter((item) => item.height > columnHeight)
          .map<LayoutWarning>((item) => ({
            code: "overflow",
            message: `节点 ${item.nodeId} 超出栏 ${column.id} 的可用高度`,
            nodeId: item.nodeId,
          })),
      );
    }),
  );
  const allWarnings = [...warnings, ...overflowWarnings];

  const pages = Array.from({ length: pageCount }, (_, pageIndex) => ({
    pageIndex,
    regions: orderedRegions.map((region) => {
      const columns = region.columns.map<ColumnPlan>((column) => {
        const sourcePage = getFlowPages(column.id)[pageIndex] || emptyFlowPage(pageIndex);
        const columnHeight = Math.max(
          0,
          availableHeightByColumn?.get(column.id) ?? getRegionHeight(region, availableHeight),
        );
        return {
          columnId: column.id,
          availableHeight: columnHeight,
          usedHeight: sourcePage.usedHeight,
          fragments: sourcePage.items.map(toFragmentPlan),
        };
      });
      return {
        regionId: region.id,
        usedHeight: Math.max(...columns.map((column) => column.usedHeight), 0),
        columns,
      };
    }),
  }));

  return {
    status: allWarnings.some((warning) => warning.code === "overflow") ? "overflow" : "ready",
    version,
    pages,
    warnings: allWarnings,
  };
};
