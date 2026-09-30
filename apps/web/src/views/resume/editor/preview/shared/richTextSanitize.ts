// 简历预览允许的富文本标签与安全链接协议。
// 分页解析与渲染拆分共用同一份白名单：两处各写一份时，改一处漏一处会让清洗强度悄悄分叉
export const RICH_TEXT_SANITIZE_CONFIG = {
  ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "a", "span"],
  ALLOWED_ATTR: ["href", "target", "rel"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i,
};
