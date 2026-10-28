import { config } from "@/configs";
import { ALL_PAGE } from "@/configs/modules/page";
import { SITE_CONFIGS } from "../../../site.config";
import { resumeTemplateList } from "@/views/resume/template/data/list";
import { themeTemplateList } from "@/domain/resume/theme/styles";
import { resolvePageSeo, type SeoMetaTag } from "@/views/resume/seo/page";

/** 当前已完成导航的路由信息。 */
interface MetadataRoute {
  /** 路由实际路径。 */
  path: string;
  /** 父路由共享的页面标识。 */
  meta: {
    /** 页面名称用于查找已有页面标题。 */
    pageName?: unknown;
  };
}

// 按统一标签定义补建或更新，静态响应和导航使用同一份标签清单。
const setTag = (tag: SeoMetaTag) => {
  let element = document.querySelector<HTMLMetaElement>(`meta[${tag.attribute}="${tag.key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(tag.attribute, tag.key);
    document.head.appendChild(element);
  }
  element.content = tag.content;
};

// 客户端只负责把共享结果写入页面，不再独立推导收录规则与结构化数据。
export const updatePageMetadata = (route: MetadataRoute, language: string) => {
  const seo = resolvePageSeo(route.path, language, config.app.defaultRoute, {
    exampleCount: resumeTemplateList.length, // 简历范本的真实条目数。
    templateCount: themeTemplateList.length, // 排版模板的真实条目数。
  }, config.app.siteUrl || location.origin);
  const pageName = typeof route.meta.pageName === "string"
    ? route.meta.pageName
    : route.path.split("/").filter(Boolean).join("-");
  const page = ALL_PAGE.value.find((item) => item.url === `/${pageName}`);
  const isProductPage = SITE_CONFIGS.some((site) => site.route === `/${pageName}`);
  document.title = !isProductPage && page?.name
    ? `${page.name}${page.desc ? ` - ${page.desc}` : ""}`
    : seo.metadata.title;
  document.documentElement.lang = seo.language;
  seo.tags.forEach(setTag);
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = seo.url;
  let schema = document.querySelector<HTMLScriptElement>('script[type="application/ld+json"]');
  if (!schema) {
    schema = document.createElement("script");
    schema.type = "application/ld+json";
    document.head.appendChild(schema);
  }
  schema.textContent = JSON.stringify(seo.schema);
  const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (icon) icon.href = seo.metadata.favicon;
};
