import type { LayoutNode } from "../types";
import type { MeasuredNode } from "./types";
import { validateContentBlockIndices } from "../contentBlocks";
import { isNeutralModuleGeometry } from "./moduleGeometry";

/** 测量宿主中每个节点的 DOM 结构标识。 */
const NODE_SELECTOR = "[data-layout-node-id]";

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
  nodeIds?: ReadonlySet<string>, // 局部测量时只读取受影响节点，未传入则测量全部节点。
): Map<string, MeasuredNode> => {
  const result = new Map<string, MeasuredNode>();
  const elements = Array.from(root.querySelectorAll<HTMLElement>(NODE_SELECTOR))
    .filter((element) => !nodeIds || nodeIds.has(element.dataset.layoutNodeId || ""));
  const elementById = new Map(elements.map((element) => [element.dataset.layoutNodeId || "", element]));
  const nodeById = new Map(nodes.map(node => [node.id, node])); // 读取通用整块能力，不识别业务名称
  // 缓存仅存活于本次测量，校验与断点读取共用尺寸，不跨内容变化复用。
  const rects = new Map<Element, DOMRect>();
  const readRect = (element: Element): DOMRect => {
    const cached = rects.get(element);
    if (cached) return cached;
    const rect = element.getBoundingClientRect();
    rects.set(element, rect);
    return rect;
  };
  const moduleBoxes = new Map<HTMLElement, DOMRect>(); // 单个整块节点承担的模块外框尺寸

  // 实际模块结构参与测量，额外占位必须下沉为通用节点而不能藏在分组外框。
  for (const module of root.querySelectorAll<HTMLElement>("[data-layout-module]")) {
    const moduleNodes = Array.from(module.querySelectorAll<HTMLElement>(NODE_SELECTOR));
    if (nodeIds && !moduleNodes.some((node) => nodeIds.has(node.dataset.layoutNodeId || ""))) continue;
    const rect = readRect(module);
    // 单个不可分节点直接承担整个外框预算，无分组跨页的重复留白问题。
    if (moduleNodes.length === 1 && nodeById.get(moduleNodes[0]!.dataset.layoutNodeId || "")?.splitMode === "whole") {
      moduleBoxes.set(moduleNodes[0]!, rect);
      continue;
    }
    if (!isNeutralModuleGeometry({ width: rect.width, height: rect.height, nodes: moduleNodes.map(readRect) })) {
      throw new Error(`模块 ${module.dataset.layoutModule} 的外框改变了节点预算，请将占位放入区域或条目`);
    }
  }

  nodes.forEach((node) => {
    if (nodeIds && !nodeIds.has(node.id)) return;
    const element = elementById.get(node.id);
    if (!element) return;
    const rect = moduleBoxes.get(element) ?? readRect(element);
    const breakPointTypes = new Map(
      node.breakPoints?.map((point) => [point.offset, point.type]) || [],
    );
    // 正文末尾须包含底部留白，避免已消费全部内容后再生成空续片。
    const declaredContentLength = node.breakPoints?.reduce((max, point) => Math.max(max, point.offset), 0) ?? 0;
    const breakPoints = Array.from(
      element.querySelectorAll<HTMLElement>("[data-layout-breakpoint-offset]"),
    )
      .map((point) => {
        const offset = Number(point.dataset.layoutBreakpointOffset);
        return { offset, type: breakPointTypes.get(offset) || "textRange", height: readRect(point).height };
      })
      .filter((point) => Number.isFinite(point.offset) && point.height > 0);
    // 正文末尾与完整节点同高，直接补齐断点，省去一份完整内容探针。
    if (declaredContentLength > 0 && rect.height > 0) breakPoints.push({
      offset: declaredContentLength,
      type: breakPointTypes.get(declaredContentLength) || "textRange",
      height: rect.height,
    });

    // 注意：断点探针内部也会渲染一份节点内容，下面的 querySelector 取到的必须是节点本体（本体恒排在探针之前）。
    // 若改用 querySelectorAll 统计节点内容，务必过滤掉 .layout-measure-breakpoint 内的副本，否则偏移会重复累计
    // 块断点：只读取渲染层声明了块区间的容器（由 BlockRange 渲染结构声明，与模块定义无关），
    // 分页据此把"能放下的块"放进当前页，块区间交给渲染层裁剪
    const blockHost = element.querySelector<HTMLElement>("[data-layout-block-range]");
    const nodeTop = readRect(element).top;
    // 绝对定位的装饰不参与内容块序号，最后内容块同时承担节点底部留白。
    const contentBlocks = blockHost ? Array.from(blockHost.children).filter((child) => !["absolute", "fixed"].includes(getComputedStyle(child).position)) : [];
    const blockBreakPoints = blockHost
      ? contentBlocks
          .map((child, index) => ({
            offset: 0,
            type: "block" as const,
            height: index === contentBlocks.length - 1 ? rect.height : readRect(child).bottom - nodeTop,
            blockEnd: index + 1,
            // 续段落在页首时渲染层会去掉该块的上外边距，这里上报供分页同步扣除
            leadingMargin: Number.parseFloat(getComputedStyle(child).marginTop) || 0,
          }))
          .filter((point) => Number.isFinite(point.height) && point.height > 0)
      : [];

    // 嵌套网格以显式块序号声明字段边界，隐藏字段不改变续页裁剪的序号。
    const indexedBlocks = Array.from(element.querySelectorAll<HTMLElement>("[data-layout-block-index]"))
      .filter((block) => !block.closest(".layout-measure-breakpoint"));
    // 隐藏字段允许空号，重复、逆序及非法编号不能进入分页。
    const blockIndices = indexedBlocks.length
      ? indexedBlocks.map((block) => block.dataset.layoutBlockIndex?.trim() ? Number(block.dataset.layoutBlockIndex) : NaN)
      : contentBlocks.map((_, index) => index);
    if (!validateContentBlockIndices(blockIndices)) throw new Error(`节点 ${node.id} 的内容块编号无效`);
    // 正文身份由组件显式标记，当前双轨分片要求正文位于最后一个内容块。
    const textBlocks = Array.from(element.querySelectorAll<HTMLElement>("[data-layout-text-block]"))
      .filter(block => !block.closest(".layout-measure-breakpoint"));
    if (textBlocks.length > 1) throw new Error(`节点 ${node.id} 只能声明一个正文块`);
    const textBlock = textBlocks[0];
    const textBlockIndex = textBlock ? indexedBlocks.length
      ? Number(textBlock.closest<HTMLElement>("[data-layout-block-index]")?.dataset.layoutBlockIndex)
      : contentBlocks.findIndex(block => block === textBlock || block.contains(textBlock)) : undefined;
    if (textBlock && (textBlockIndex === undefined || textBlockIndex < 0 || textBlockIndex !== blockIndices[blockIndices.length - 1])) {
      throw new Error(`节点 ${node.id} 的正文必须声明为最后一个内容块`);
    }
    if (declaredContentLength > 0 && blockIndices.length && textBlockIndex === undefined) throw new Error(`节点 ${node.id} 缺少正文块标记`);
    const indexedBreakPoints = indexedBlocks.map((block, index) => {
      const blockRect = readRect(block);
      const previousBottom = index > 0 ? readRect(indexedBlocks[index - 1]!).bottom : blockRect.top;
      return {
        offset: 0, // 块断点不消费正文字符
        type: "block" as const, // 显式内容块断点
        height: blockRect.bottom - nodeTop, // 块底边相对节点起点的累计高度
        blockEnd: Number(block.dataset.layoutBlockIndex) + 1, // 当前块之后的稳定裁剪序号
        leadingMargin: Math.max(0, blockRect.top - previousBottom), // 续页首块需要移除的网格间距
      };
    }).filter((point) => Number.isFinite(point.blockEnd) && point.height > 0);

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
          height: line.bottom - nodeTop,
        })),
      )
      .filter((point) => Number.isFinite(point.offset) && point.height > 0);

    result.set(node.id, {
      nodeId: node.id,
      width: rect.width,
      fullHeight: rect.height,
      blockIndices: node.splitMode === "whole" ? [] : blockIndices, // 实际存在的稳定块编号，允许隐藏字段留下空号
      textBlockIndex: node.splitMode === "whole" ? undefined : textBlockIndex, // 正文身份只来自组件标记
      breakPoints: node.splitMode === "whole" ? [] : [...blockBreakPoints, ...indexedBreakPoints, ...breakPoints, ...lineBreakPoints],
      // 富文本从自身断点取正文末尾，按行拆分的纯文本则从实测行尾取，避免续页提前结束。
      contentLength: Math.max(
        lineBreakPoints.reduce((max, point) => Math.max(max, point.offset), 0),
        node.breakPoints?.reduce((max, point) => Math.max(max, point.offset), 0) ?? 0,
      ),
      droppedTopSpacing,
    });
  });

  return result;
};
