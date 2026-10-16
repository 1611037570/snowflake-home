import { config } from "@/configs";
import { ALL_PAGE } from "@/configs/modules/page";
import { resolveSiteMetadata, SITE_CONFIGS } from "../../../site.config";
import { resumeTemplateList } from "@/views/resume/template/data/list";
import { themeTemplateList } from "@/domain/resume/theme/styles";

/** 当前已完成导航的路由信息。 */
interface MetadataRoute {
  /** 路由实际路径。 */
  path: string;
  /** 父路由共享的页面标识。 */
  meta: { pageName?: unknown }; // 页面名称用于查找已有页面标题
}

// 缺失时补建标签，存在则直接改内容，避免多次导航后重复注入。
const setMeta = (name: string, content: string) => {
  let element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
};

// og 系列用 property 而非 name 标识，单独走一套补建逻辑。
const setProperty = (property: string, content: string) => {
  let element = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }
  element.content = content;
};

// 路由与语言共同驱动页面信息，统一覆盖旧页面的描述、关键词、收录指令与主链接。
export const updatePageMetadata = (route: MetadataRoute, language: string) => {
  // 浏览器与构建期均从实际范本和主题清单取得 SEO 数量。
  const metadata = resolveSiteMetadata(route.path, language, config.app.defaultRoute, {
    exampleCount: resumeTemplateList.length, // 简历范本的真实条目数。
    templateCount: themeTemplateList.length, // 排版模板的真实条目数。
  });
  const pageName = typeof route.meta.pageName === "string"
    ? route.meta.pageName
    : route.path.split("/").filter(Boolean).join("-");
  const page = ALL_PAGE.value.find((item) => item.url === `/${pageName}`);
  const isProductPage = SITE_CONFIGS.some((site) => site.route === `/${pageName}`);
  document.title = !isProductPage && page?.name
    ? `${page.name}${page.desc ? ` - ${page.desc}` : ""}`
    : metadata.title;
  document.documentElement.lang = language.startsWith("en") ? "en" : "zh-CN";
  setMeta("description", metadata.description);
  setMeta("keywords", metadata.keywords);
  // 工具页与用户私有页不参与收录，统一输出 noindex 指令
  setMeta("robots", metadata.noindex ? "noindex,nofollow" : "index,follow");
  // 优先用构建期配置的站点地址：通过预览域名或 IP 访问时，canonical 不应跟着变成临时域名
  const origin = config.app.siteUrl || location.origin;
  // SPA 各路由共用同一份 HTML，必须输出自指 canonical，否则会被判为重复内容
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = `${origin}${route.path}`;
  // 会执行 JS 的抓取器可以拿到按路由定制的社交卡片，静态兜底值写在 index.html 里
  setProperty("og:title", metadata.title);
  setProperty("og:description", metadata.description);
  setProperty("og:url", `${origin}${route.path}`);
  const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (icon) icon.href = metadata.favicon;
};
