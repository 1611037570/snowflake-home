import DOMPurify from "dompurify";
import type { BreakPoint } from "../types";

/** 富文本块的基础信息 */
export interface RichTextBlock {
  /** 原始 HTML 标签名称 */
  tag: string;
  /** 原始安全属性 */
  attrs: Record<string, string>;
  /** 当前块的安全 HTML 内容 */
  html: string;
  /** 当前块的纯文本内容 */
  text: string;
  /** 当前块在分页内容中的起始位置，显式换行也计入偏移 */
  startOffset: number;
  /** 当前块在分页内容中的结束位置，显式换行也计入偏移 */
  endOffset: number;
}

/** 富文本解析结果 */
export interface ParsedRichText {
  /** 清洗后的完整 HTML */
  html: string;
  /** 顶层富文本块 */
  blocks: RichTextBlock[];
  /** 可用于分页的语义断点 */
  breakPoints: BreakPoint[];
  /** 完整内容的分页偏移长度，包含文字和显式换行 */
  textLength: number;
}

/** 富文本切片偏移对应的 DOM 区间，一个 br 也占一个可分页位置。 */
interface SlicePosition {
  startNode: Node;
  startOffset: number;
  endNode: Node;
  endOffset: number;
}

/** 切片解析缓存：同一份 HTML 只解析一次，分片与断点探针复用同一批位置映射 */
const sliceCache = new Map<
  string,
  { container: HTMLDivElement; positions: SlicePosition[]; total: number }
>();
/** 切片缓存条目上限，避免超长正文长期占用内存 */
const SLICE_CACHE_MAX = 200;

/** 解析切片所需的文本节点，命中缓存时直接复用 */
const parseSliceNodes = (html: string) => {
  const cached = sliceCache.get(html);
  if (cached) return cached;

  const container = document.createElement("div");
  container.innerHTML = DOMPurify.sanitize(html || "", sanitizeConfig);
  const positions: SlicePosition[] = [];
  const appendPositions = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node as Text;
      for (let index = 0; index < (textNode.nodeValue?.length || 0); index += 1) {
        positions.push({
          startNode: textNode,
          startOffset: index,
          endNode: textNode,
          endOffset: index + 1,
        });
      }
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const element = node as Element;
    if (element.tagName.toLowerCase() === "br") {
      const parent = element.parentNode;
      if (!parent) return;
      const index = Array.from(parent.childNodes).indexOf(element);
      positions.push({
        startNode: parent,
        startOffset: index,
        endNode: parent,
        endOffset: index + 1,
      });
      return;
    }
    Array.from(element.childNodes).forEach(appendPositions);
  };
  // 顶层空白文本不参与偏移；段落内文字和 br 都计入，确保空行有独立分页位置
  Array.from(container.childNodes).forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE && !(child.textContent || "").trim()) return;
    appendPositions(child);
  });
  const total = positions.length;
  const entry = { container, positions, total };
  if (sliceCache.size >= SLICE_CACHE_MAX) sliceCache.clear();
  sliceCache.set(html, entry);
  return entry;
};

/** 按包含显式换行的内容偏移截取安全富文本，并保留对应标签结构。 */
export const sliceRichTextHtml = (html: string, start = 0, end?: number): string => {
  const { container, positions, total } = parseSliceNodes(html || "");
  const safeStart = Math.max(0, Math.min(start, total));
  const safeEnd = Math.max(safeStart, Math.min(end ?? total, total));
  if (safeStart >= safeEnd) return "";

  const range = document.createRange();
  const first = positions[safeStart];
  const last = positions[safeEnd - 1];
  if (!first || !last) return "";
  range.setStart(first.startNode, first.startOffset);
  range.setEnd(last.endNode, last.endOffset);
  const result = document.createElement("div");
  result.appendChild(range.cloneContents());
  return result.innerHTML;
};

/** 预览富文本允许的标签和属性 */
const sanitizeConfig = {
  ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "a", "span"],
  ALLOWED_ATTR: ["href", "target", "rel"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i,
};

/** 字符级兜底断点最多保留的采样数量，避免超长正文生成过大的测量树。 */
const MAX_CHAR_BREAK_POINTS = 64;
/** 字符级断点的最小步长：分页填充精度到几个字即可，过密会拖慢测量与缩略图渲染。 */
const MIN_CHAR_BREAK_POINT_STEP = 4;

/** 读取节点分页偏移长度：文字和显式换行都占一个位置。 */
const getLogicalLength = (node: Node): number => {
  if (node.nodeType === Node.TEXT_NODE) return node.nodeValue?.length || 0;
  if (node.nodeType !== Node.ELEMENT_NODE) return 0;
  const element = node as Element;
  if (element.tagName.toLowerCase() === "br") return 1;
  return Array.from(element.childNodes).reduce((sum, child) => sum + getLogicalLength(child), 0);
};

/** 将元素属性转换为普通对象 */
const getAttributes = (element: Element): Record<string, string> =>
  Object.fromEntries(
    Array.from(element.attributes).map(({ name, value }) => [name, value]),
  );

/** 生成一个不重复的语义断点 */
const appendBreakPoint = (points: BreakPoint[], offsets: Set<number>, point: BreakPoint) => {
  if (point.offset <= 0 || offsets.has(point.offset)) return;
  offsets.add(point.offset);
  points.push(point);
};

/** 为富文本中的每个显式换行建立断点，分页可在换行处逐行推进。 */
const collectLineBreakPoints = (
  node: Node,
  startOffset: number,
  points: BreakPoint[],
  offsets: Set<number>,
) => {
  let offset = startOffset;
  const visit = (current: Node) => {
    if (current.nodeType === Node.TEXT_NODE) {
      offset += current.nodeValue?.length || 0;
      return;
    }
    if (current.nodeType !== Node.ELEMENT_NODE) return;
    const element = current as Element;
    if (element.tagName.toLowerCase() === "br") {
      offset += 1;
      appendBreakPoint(points, offsets, { offset, type: "paragraph" });
      return;
    }
    Array.from(element.childNodes).forEach(visit);
  };
  visit(node);
};

/** 提取列表中的列表项断点 */
const collectListItemBreakPoints = (
  element: Element,
  startOffset: number,
  points: BreakPoint[],
  offsets: Set<number>,
) => {
  let offset = startOffset;
  Array.from(element.children).forEach((child) => {
    if (child.tagName.toLowerCase() !== "li") return;
    collectLineBreakPoints(child, offset, points, offsets);
    offset += getLogicalLength(child);
    appendBreakPoint(points, offsets, { offset, type: "listItem" });
  });
};

/** 将安全 HTML 拆分为顶层块并建立语义断点 */
const parseBlocks = (html: string) => {
  const template = document.createElement("template");
  template.innerHTML = html;

  const blocks: RichTextBlock[] = [];
  const breakPoints: BreakPoint[] = [];
  const breakPointOffsets = new Set<number>();
  let offset = 0;

  Array.from(template.content.childNodes).forEach((node) => {
    const text = node.textContent || "";
    const logicalLength = getLogicalLength(node);
    if (!logicalLength || (!text.trim() && node.nodeType === Node.TEXT_NODE)) return;

    const startOffset = offset;
    const endOffset = startOffset + logicalLength;
    const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : undefined;
    const tag = element?.tagName.toLowerCase() || "span";

    blocks.push({
      tag,
      attrs: element ? getAttributes(element) : {},
      html: element?.innerHTML || text,
      text,
      startOffset,
      endOffset,
    });

    if (element?.tagName.toLowerCase() === "ul" || element?.tagName.toLowerCase() === "ol") {
      collectListItemBreakPoints(element, startOffset, breakPoints, breakPointOffsets);
    } else {
      collectLineBreakPoints(node, startOffset, breakPoints, breakPointOffsets);
      appendBreakPoint(breakPoints, breakPointOffsets, {
        offset: endOffset,
        type: "paragraph",
      });
    }

    offset = endOffset;
  });

  return { blocks, breakPoints, breakPointOffsets, textLength: offset };
};

/** 为语义断点之间的超长文本补充字符级断点。 */
const appendCharacterBreakPoints = (
  points: BreakPoint[],
  offsets: Set<number>,
  textLength: number,
) => {
  if (textLength <= 1) return;

  const step = Math.max(
    MIN_CHAR_BREAK_POINT_STEP,
    Math.ceil(textLength / MAX_CHAR_BREAK_POINTS),
  );
  for (let offset = step; offset < textLength; offset += step) {
    appendBreakPoint(points, offsets, { offset, type: "char" });
  }
  points.sort((left, right) => left.offset - right.offset);
};

/** 清洗并解析富文本，供排版节点适配器使用 */
export const parseRichText = (content: string): ParsedRichText => {
  const html = DOMPurify.sanitize(content || "", sanitizeConfig);
  const { blocks, breakPoints, breakPointOffsets, textLength } = parseBlocks(html);

  if (textLength > 0 && !breakPointOffsets.has(textLength)) {
    breakPointOffsets.add(textLength);
    breakPoints.push({ offset: textLength, type: "textRange" });
  }
  appendCharacterBreakPoints(breakPoints, breakPointOffsets, textLength);

  return {
    html,
    blocks,
    breakPoints,
    textLength,
  };
};
