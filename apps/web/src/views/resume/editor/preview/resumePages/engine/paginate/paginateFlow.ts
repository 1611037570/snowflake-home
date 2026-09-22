import type { MeasuredNode } from "../measure/types";
import type { LayoutNode } from "../types";

/** 单栏页面中当前阶段使用的完整节点项 */
export interface FlowPageItem {
  /** 排版节点编号 */
  nodeId: string;
  /** 来源模块 key */
  sourceModuleKey: string;
  /** 当前节点占用的高度 */
  height: number;
}

/** 单栏分页结果，后续会扩展为分片结果 */
export interface FlowPage {
  /** 页码，从 0 开始 */
  pageIndex: number;
  /** 当前页已经使用的高度 */
  usedHeight: number;
  /** 当前页中的节点 */
  items: FlowPageItem[];
}

/** 单栏分页的输入参数 */
export interface PaginateFlowOptions {
  /** 按顺序排列的排版节点 */
  nodes: LayoutNode[];
  /** 节点测量结果，分页引擎不直接读取 DOM */
  measurements: ReadonlyMap<string, MeasuredNode>;
  /** 当前栏可用高度 */
  availableHeight: number;
  /** 不同节点之间的间距 */
  gap: number;
}

/** 读取节点测量结果，缺少测量数据时直接报告配置错误 */
const getMeasurement = (
  node: LayoutNode,
  measurements: ReadonlyMap<string, MeasuredNode>,
): MeasuredNode => {
  const measurement = measurements.get(node.id);
  if (!measurement) {
    throw new Error(`缺少排版节点测量结果：${node.id}`);
  }
  return measurement;
};

/**
 * 按节点顺序进行单栏贪心分页。
 * 当前阶段只处理完整节点，节点分片将在后续步骤中加入。
 */
export const paginateFlow = ({
  nodes,
  measurements,
  availableHeight,
  gap,
}: PaginateFlowOptions): FlowPage[] => {
  const safeAvailableHeight = Math.max(0, availableHeight);
  const safeGap = Number.isFinite(gap) ? Math.max(0, gap) : 0;
  const pages: FlowPage[] = [];
  let currentPage: FlowPage = {
    pageIndex: 0,
    usedHeight: 0,
    items: [],
  };

  const pushPage = () => {
    if (currentPage.items.length > 0) pages.push(currentPage);
    currentPage = {
      pageIndex: pages.length,
      usedHeight: 0,
      items: [],
    };
  };

  for (const node of nodes) {
    const measurement = getMeasurement(node, measurements);
    const height = Math.max(0, measurement.fullHeight);
    const nodeGap = currentPage.items.length > 0 ? safeGap : 0;
    const doesNotFit = currentPage.usedHeight + nodeGap + height > safeAvailableHeight;

    if (doesNotFit && currentPage.items.length > 0) {
      pushPage();
    }

    const pageGap = currentPage.items.length > 0 ? safeGap : 0;
    currentPage.items.push({
      nodeId: node.id,
      sourceModuleKey: node.sourceModuleKey,
      height,
    });
    currentPage.usedHeight += pageGap + height;
  }

  if (currentPage.items.length > 0) pages.push(currentPage);
  return pages;
};
