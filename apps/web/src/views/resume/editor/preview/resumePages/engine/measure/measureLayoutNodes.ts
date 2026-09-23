import type { LayoutNode } from "../types";
import type { MeasuredNode } from "./types";

/** 测量宿主中每个节点的 DOM 结构标识。 */
const NODE_SELECTOR = "[data-layout-node-id]";

/**
 * 计算测量宿主的布局缩放比例。
 * 预览区用 transform: scale() 缩放整页，该变换不改变布局尺寸但会缩放 getBoundingClientRect 的结果，
 * 因此按测量宿主自身换算回未缩放的布局像素，分页高度才能与真实页面像素一致。
 */
const getLayoutScale = (root: HTMLElement): number => {
  const layoutWidth = root.offsetWidth;
  if (!layoutWidth) return 1;
  const scale = root.getBoundingClientRect().width / layoutWidth;
  return Number.isFinite(scale) && scale > 0 ? scale : 1;
};

/** 读取一个 DOM 节点的实际高度和宽度（已换算回未缩放的布局像素）。 */
const readRect = (element: HTMLElement, scale: number) => {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width / scale,
    height: rect.height / scale,
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
  const scale = getLayoutScale(root);
  const elements = Array.from(root.querySelectorAll<HTMLElement>(NODE_SELECTOR));
  const elementById = new Map(elements.map((element) => [element.dataset.layoutNodeId || "", element]));

  nodes.forEach((node) => {
    const element = elementById.get(node.id);
    if (!element) return;
    const rect = readRect(element, scale);
    const breakPointTypes = new Map(
      node.breakPoints?.map((point) => [point.offset, point.type]) || [],
    );
    const breakPoints = Array.from(
      element.querySelectorAll<HTMLElement>("[data-layout-breakpoint-offset]"),
    )
      .map((point) => {
        const offset = Number(point.dataset.layoutBreakpointOffset);
        const height = point.getBoundingClientRect().height / scale;
        return { offset, type: breakPointTypes.get(offset) || "textRange", height };
      })
      .filter((point) => Number.isFinite(point.offset) && point.height > 0);

    // 块断点：只读取渲染层声明了块区间的容器（由 BlockRange 渲染结构声明，与模块定义无关），
    // 分页据此把"能放下的块"放进当前页，块区间交给渲染层裁剪
    const blockHost = element.querySelector<HTMLElement>("[data-layout-block-range]");
    const nodeTop = element.getBoundingClientRect().top;
    const blockBreakPoints = blockHost
      ? Array.from(blockHost.children)
          .map((child, index) => ({
            offset: 0,
            type: "block" as const,
            height: (child.getBoundingClientRect().bottom - nodeTop) / scale,
            blockEnd: index + 1,
          }))
          .filter((point) => Number.isFinite(point.height) && point.height > 0)
      : [];

    // 续段装饰会去掉上内边距（中段同时去掉下内边距），分页估算续段高度时需扣除，才能与真实渲染一致
    const style = getComputedStyle(blockHost ?? element);
    const droppedPadding = {
      top: Number.parseFloat(style.paddingTop) || 0,
      bottom: Number.parseFloat(style.paddingBottom) || 0,
    };

    result.set(node.id, {
      nodeId: node.id,
      width: rect.width,
      fullHeight: rect.height,
      minHeight: Math.max(rect.height, node.breakPolicy.minHeight || 0),
      breakPoints: [...blockBreakPoints, ...breakPoints],
      droppedPadding,
    });
  });

  nodes.forEach((node) => {
    if (!node.title) return;
    const titleElement = elementById.get(node.title.id);
    if (!titleElement) return;
    const rect = readRect(titleElement, scale);
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
