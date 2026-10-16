import type { FooterTemplateId } from "@/domain/resume/theme/uiTypes";
import { getPreviewText } from "./i18n";

// 文字页码模板使用中文序数，其他语言沿用对应语言的页码文案。
const formatPageNumber = (page: number, lang: string) => {
  if (lang !== "zh") return String(page);
  const digits = "零一二三四五六七八九";
  if (page < 10) return digits[page];
  if (page < 20) return `十${page % 10 ? digits[page % 10] : ""}`;
  if (page < 100) return `${digits[Math.floor(page / 10)]}十${page % 10 ? digits[page % 10] : ""}`;
  return String(page);
};

// 页尾模板编号集中映射到对应文案生成方式，预览与测量共用。
const footerTemplateFormatters: Record<FooterTemplateId, (page: number, lang: string, total: number) => string> = {
  total: (page, lang, total) => getPreviewText("footerTotal", lang, { page, total }), // 当前页与总页数模板。
  number: (page) => String(page), // 数字页码模板。
  page: (page, lang) => getPreviewText("footerPage", lang, { page: formatPageNumber(page, lang) }), // 文字页码模板。
};

// 自定义文字可留空，模板只负责页码部分。
export const getResumeFooterText = (brand: string, template: FooterTemplateId, page: number, total: number, lang: string) =>
  [brand.trim(), footerTemplateFormatters[template](page, lang, total)].filter(Boolean).join(" · ");
