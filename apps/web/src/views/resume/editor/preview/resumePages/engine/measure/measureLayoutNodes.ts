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
 * 采集纯文本容器每一行的结束偏移（相对容器文本起点）与行底边。
 * 用于让描述类文本按行拆分：放不下的行移到下一页，而不是整块被推走
 */
const collectLineEndOffsets = (element: HTMLElement) => {
  const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNode = walker.nextNode() as Text | null;
  const text = textNode?.textContent || "";
  if (!textNode || !text) return [];
  const range = document.createRange();
  const result: Array<{ offset: number; bottom: number }> = [];
  let currentTop: number | null = null;
  let currentBottom = 0;
  for (let index = 0; index < text.length; index += 1) {
    range.setStart(textNode, index);
    range.setEnd(textNode, index + 1);
    const rects = range.getClientRects();
    const rect = rects[rects.length - 1];
    if (!rect) continue;
    // 字符落到新的一行时，上一个字符的位置就是上一行的行尾偏移
    if (currentTop !== null && rect.top > currentTop + 0.5) {
      result.push({ offset: index, bottom: currentBottom });
    }
    currentTop = rect.top;
    currentBottom = rect.bottom;
  }
  // 最后一行同样是一个可拆分点
  if (currentTop !== null) result.push({ offset: text.length, bottom: currentBottom });
  return result.filter((line, index, list) => index === 0 || line.offset > list[index - 1].offset);
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

    // 注意：断点探针内部也会渲染一份节点内容，下面的 querySelector 取到的必须是节点本体（本体恒排在探针之前）。
    // 若改用 querySelectorAll 统计节点内容，务必过滤掉 .layout-measure-breakpoint 内的副本，否则偏移会重复累计
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
            // 续段落在页首时渲染层会去掉该块的上外边距，这里上报供分页同步扣除
            leadingMargin: Number.parseFloat(getComputedStyle(child).marginTop) || 0,
          }))
          .filter((point) => Number.isFinite(point.height) && point.height > 0)
      : [];

    // 续段会去掉内容盒上内边距，测量分页高度时一并扣除
    const style = getComputedStyle(blockHost ?? element);
    const droppedTopSpacing = Number.parseFloat(style.paddingTop) || 0;

    // 行级断点：声明了按行拆分的纯文本容器（如媒体描述）逐行上报偏移，
    // 分页据此只把放不下的行移到下一页；探针内的副本要排除，否则偏移会重复
    const lineBreakPoints = Array.from(
      element.querySelectorAll<HTMLElement>("[data-layout-split-lines]"),
    )
      .filter((text) => !text.closest(".layout-measure-breakpoint"))
      .flatMap((text) =>
        collectLineEndOffsets(text).map((line) => ({
          offset: line.offset,
          type: "textRange" as const,
          height: (line.bottom - nodeTop) / scale,
        })),
      )
      .filter((point) => Number.isFinite(point.offset) && point.height > 0);

    result.set(node.id, {
      nodeId: node.id,
      width: rect.width,
      fullHeight: rect.height,
      minHeight: Math.max(rect.height, node.breakPolicy.minHeight || 0),
      breakPoints: [...blockBreakPoints, ...breakPoints, ...lineBreakPoints],
      droppedTopSpacing,
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
