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
  /** 当前块在完整文本中的起始位置 */
  startOffset: number;
  /** 当前块在完整文本中的结束位置 */
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
  /** 完整纯文本长度 */
  textLength: number;
}

/** 切片解析缓存：同一份 HTML 只解析一次，分片与断点探针复用同一批文本节点 */
const sliceCache = new Map<string, { textNodes: Text[]; total: number }>();
/** 切片缓存条目上限，避免超长正文长期占用内存 */
const SLICE_CACHE_MAX = 200;

/** 解析切片所需的文本节点，命中缓存时直接复用 */
const parseSliceNodes = (html: string) => {
  const cached = sliceCache.get(html);
  if (cached) return cached;

  const container = document.createElement("div");
  container.innerHTML = DOMPurify.sanitize(html || "", sanitizeConfig);
  const textNodes: Text[] = [];
  // 只统计参与断点偏移的内容：顶层空白节点不计入字符数，与 parseRichText 的块口径保持一致
  Array.from(container.childNodes).forEach((child) => {
    if (!(child.textContent || "").trim()) return;
    const walker = document.createTreeWalker(child, NodeFilter.SHOW_TEXT);
    let textNode: Node | null;
    while ((textNode = walker.nextNode())) {
      if (textNode.nodeValue) textNodes.push(textNode as Text);
    }
  });
  const total = textNodes.reduce((sum, node) => sum + (node.nodeValue?.length || 0), 0);
  const entry = { textNodes, total };
  if (sliceCache.size >= SLICE_CACHE_MAX) sliceCache.clear();
  sliceCache.set(html, entry);
  return entry;
};

/** 按纯文本偏移截取安全富文本，并保留截取范围内的标签结构。 */
export const sliceRichTextHtml = (html: string, start = 0, end?: number): string => {
  const { textNodes, total } = parseSliceNodes(html || "");
  const safeStart = Math.max(0, Math.min(start, total));
  const safeEnd = Math.max(safeStart, Math.min(end ?? total, total));
  if (safeStart >= safeEnd) return "";

  const range = document.createRange();
  let offset = 0;
  let started = false;
  let ended = false;
  textNodes.forEach((node) => {
    if (ended) return;
    const length = node.nodeValue?.length || 0;
    if (!started && offset + length >= safeStart) {
      range.setStart(node, safeStart - offset);
      started = true;
    }
    if (started && offset + length >= safeEnd) {
      range.setEnd(node, safeEnd - offset);
      ended = true;
    }
    offset += length;
  });

  if (!started) return "";
  if (!ended) {
    const lastNode = textNodes[textNodes.length - 1];
    if (lastNode) range.setEnd(lastNode, lastNode.nodeValue?.length || 0);
  }
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

/** 读取节点的纯文本长度 */
const getTextLength = (node: Node): number => node.textContent?.length || 0;

/** 将元素属性转换为普通对象 */
const getAttributes = (element: Element): Record<string, string> =>
  Object.fromEntries(
    Array.from(element.attributes).map(({ name, value }) => [name, value]),
  );

/** 生成一个不重复的语义断点 */
const appendBreakPoint = (points: BreakPoint[], point: BreakPoint) => {
  if (point.offset <= 0 || points.some((item) => item.offset === point.offset)) return;
  points.push(point);
};

/** 提取列表中的列表项断点 */
const collectListItemBreakPoints = (
  element: Element,
  startOffset: number,
  points: BreakPoint[],
) => {
  let offset = startOffset;
  Array.from(element.children).forEach((child) => {
    if (child.tagName.toLowerCase() !== "li") return;
    offset += getTextLength(child);
    appendBreakPoint(points, { offset, type: "listItem" });
  });
};

/** 将安全 HTML 拆分为顶层块并建立语义断点 */
const parseBlocks = (html: string) => {
  const template = document.createElement("template");
  template.innerHTML = html;

  const blocks: RichTextBlock[] = [];
  const breakPoints: BreakPoint[] = [];
  let offset = 0;

  Array.from(template.content.childNodes).forEach((node) => {
    const text = node.textContent || "";
    if (!text.trim()) return;

    const startOffset = offset;
    const endOffset = startOffset + text.length;
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
      collectListItemBreakPoints(element, startOffset, breakPoints);
    } else {
      appendBreakPoint(breakPoints, {
        offset: endOffset,
        type: "paragraph",
      });
    }

    offset = endOffset;
  });

  return { blocks, breakPoints, textLength: offset };
};

/** 为语义断点之间的超长文本补充字符级断点。 */
const appendCharacterBreakPoints = (points: BreakPoint[], textLength: number) => {
  if (textLength <= 1) return;

  const step = Math.max(
    MIN_CHAR_BREAK_POINT_STEP,
    Math.ceil(textLength / MAX_CHAR_BREAK_POINTS),
  );
  for (let offset = step; offset < textLength; offset += step) {
    appendBreakPoint(points, { offset, type: "char" });
  }
  points.sort((left, right) => left.offset - right.offset);
};

/** 清洗并解析富文本，供排版节点适配器使用 */
export const parseRichText = (content: string): ParsedRichText => {
  const html = DOMPurify.sanitize(content || "", sanitizeConfig);
  const { blocks, breakPoints, textLength } = parseBlocks(html);

  if (textLength > 0 && !breakPoints.some((point) => point.offset === textLength)) {
    breakPoints.push({ offset: textLength, type: "textRange" });
  }
  appendCharacterBreakPoints(breakPoints, textLength);

  return {
    html,
    blocks,
    breakPoints,
    textLength,
  };
};
