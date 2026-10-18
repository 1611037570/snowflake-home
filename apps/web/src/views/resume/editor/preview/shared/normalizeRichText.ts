import DOMPurify from "dompurify";
import { RICH_TEXT_SANITIZE_CONFIG } from "./richTextSanitize";

// 转义模型返回的普通文本，避免转换 Markdown 时把文本内容当作标签执行
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// 转换简历正文中常见的行内 Markdown，保留加粗与强调语义
const normalizeInline = (value: string) =>
  escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");

// 将 Markdown 或纯文本转换为编辑器支持的基础富文本块
const textToHtml = (value: string) => {
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let listType: "ul" | "ol" | "" = "";
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${normalizeInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!listType || !listItems.length) return;
    blocks.push(
      `<${listType}>${listItems
        .map((item) => `<li>${normalizeInline(item)}</li>`)
        .join("")}</${listType}>`,
    );
    listType = "";
    listItems = [];
  };

  value.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      return;
    }
    const unordered = line.match(/^[-+*]\s+(.+)$/);
    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const nextType = unordered ? "ul" : "ol";
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((unordered?.[1] ?? ordered?.[1])!);
      return;
    }
    flushList();
    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      flushParagraph();
      blocks.push(`<p><strong>${normalizeInline(heading[1]!)}</strong></p>`);
      return;
    }
    paragraph.push(line.replace(/^>\s?/, ""));
  });
  flushParagraph();
  flushList();
  return blocks.join("");
};

// 统一模型正文输出：HTML 安全清洗，Markdown 与纯文本转换为富文本 HTML
export const normalizeRichTextHtml = (value: string) => {
  const source = value
    .trim()
    .replace(/^```(?:html|markdown|md)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  if (!source) return "";
  const html = /<\/?(?:p|ul|ol|li|strong|b|em|i|u|br|a|span)(?:\s|>)/i.test(source)
    ? source
    : textToHtml(source);
  const sanitized = DOMPurify.sanitize(html, RICH_TEXT_SANITIZE_CONFIG);
  // 只有行内标签时补齐段落容器，保证编辑器与写入校验接收一致结构
  return /<(?:p|ul|ol)(?:\s|>)/i.test(sanitized) ? sanitized : `<p>${sanitized}</p>`;
};
