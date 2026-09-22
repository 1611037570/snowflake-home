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

/** 预览富文本允许的标签和属性 */
const sanitizeConfig = {
  ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "a", "span"],
  ALLOWED_ATTR: ["href", "target", "rel"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i,
};

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

/** 清洗并解析富文本，供排版节点适配器使用 */
export const parseRichText = (content: string): ParsedRichText => {
  const html = DOMPurify.sanitize(content || "", sanitizeConfig);
  const { blocks, breakPoints, textLength } = parseBlocks(html);

  if (textLength > 0 && !breakPoints.some((point) => point.offset === textLength)) {
    breakPoints.push({ offset: textLength, type: "textRange" });
  }

  return {
    html,
    blocks,
    breakPoints,
    textLength,
  };
};
