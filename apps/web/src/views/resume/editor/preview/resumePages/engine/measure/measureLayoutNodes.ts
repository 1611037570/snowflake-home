import type { LayoutNode } from "../types";
import type { MeasuredNode } from "./types";

/** 测量宿主中每个节点的 DOM 结构标识。 */
const NODE_SELECTOR = "[data-layout-node-id]";

/** 读取一个 DOM 节点的实际高度和宽度。 */
const readRect = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
  };
};

/**
 * 从测量宿主读取节点高度和语义断点。
 * 该函数只读取 DOM，不改变节点、不执行分页，也不依赖业务模块名称。
 */
export const measureLayoutNodes = (
  root: HTMLElement,
  nodes: LayoutNode[],
): Map<string, MeasuredNode> => {
  const result = new Map<string, MeasuredNode>();
  const elements = Array.from(root.querySelectorAll<HTMLElement>(NODE_SELECTOR));
  const elementById = new Map(elements.map((element) => [element.dataset.layoutNodeId || "", element]));

  nodes.forEach((node) => {
    const element = elementById.get(node.id);
    if (!element) return;
    const rect = readRect(element);
    const breakPointTypes = new Map(
      node.breakPoints?.map((point) => [point.offset, point.type]) || [],
    );
    const breakPoints = Array.from(
      element.querySelectorAll<HTMLElement>("[data-layout-breakpoint-offset]"),
    )
      .map((point) => {
        const offset = Number(point.dataset.layoutBreakpointOffset);
        const height = point.getBoundingClientRect().height;
        return { offset, type: breakPointTypes.get(offset) || "textRange", height };
      })
      .filter((point) => Number.isFinite(point.offset) && point.height > 0);

    result.set(node.id, {
      nodeId: node.id,
      width: rect.width,
      fullHeight: rect.height,
      minHeight: Math.max(rect.height, node.breakPolicy.minHeight || 0),
      breakPoints,
    });
  });

  nodes.forEach((node) => {
    if (!node.title) return;
    const titleElement = elementById.get(node.title.id);
    if (!titleElement) return;
    const rect = readRect(titleElement);
    result.set(node.title.id, {
      nodeId: node.title.id,
      width: rect.width,
      fullHeight: rect.height,
      minHeight: rect.height,
      breakPoints: [],
    });
  });

  return result;
};
