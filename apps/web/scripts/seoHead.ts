import { escapeHtml } from "../src/views/resume/seo/content";
import type { resolvePageSeo } from "../src/views/resume/seo/page";

// 默认入口与独立网页共用完整头部模板，新增标签无需调整替换正则。
export function renderSeoHead(page: ReturnType<typeof resolvePageSeo>) {
  return `<meta name="sf-seo-start">
    <title>${escapeHtml(page.metadata.title)}</title>
    ${page.tags.map((tag) => `<meta ${tag.attribute}="${tag.key}" content="${escapeHtml(tag.content)}">`).join("\n")}
    <link rel="canonical" href="${escapeHtml(page.url)}">
    <script type="application/ld+json">${JSON.stringify(page.schema).replaceAll("<", "\\u003c")}</script>
    <meta name="sf-seo-end">`;
}

// 仅替换明确标记的搜索信息区域，保留其他页头脚本与样式。
export function replaceSeoHead(html: string, page: ReturnType<typeof resolvePageSeo>) {
  const region = /<meta\b[^>]*name=["']sf-seo-start["'][^>]*>[\s\S]*?<meta\b[^>]*name=["']sf-seo-end["'][^>]*>/i;
  if (!region.test(html)) throw new Error("缺少搜索信息模板区域");
  return html.replace(region, () => renderSeoHead(page));
}
