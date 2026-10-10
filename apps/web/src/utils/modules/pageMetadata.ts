import { config } from "@/configs";
import { ALL_PAGE } from "@/configs/modules/page";
import { resolveSiteMetadata, SITE_CONFIGS } from "../../../site.config";

/** 当前已完成导航的路由信息。 */
interface MetadataRoute {
  /** 路由实际路径。 */
  path: string;
  /** 父路由共享的页面标识。 */
  meta: { pageName?: unknown }; // 页面名称用于查找已有页面标题
}

// 路由与语言共同驱动页面信息，统一覆盖旧页面的描述、关键词与图标。
export const updatePageMetadata = (route: MetadataRoute, language: string) => {
  const metadata = resolveSiteMetadata(route.path, language, config.app.defaultRoute);
  const pageName = typeof route.meta.pageName === "string"
    ? route.meta.pageName
    : route.path.split("/").filter(Boolean).join("-");
  const page = ALL_PAGE.value.find((item) => item.url === `/${pageName}`);
  const isProductPage = SITE_CONFIGS.some((site) => site.route === `/${pageName}`);
  document.title = !isProductPage && page?.name
    ? `${page.name}${page.desc ? ` - ${page.desc}` : ""}`
    : metadata.title;
  document.documentElement.lang = language.startsWith("en") ? "en" : "zh-CN";
  for (const name of ["description", "keywords"] as const) {
    let element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
    if (!element) {
      element = document.createElement("meta");
      element.name = name;
      document.head.appendChild(element);
    }
    element.content = metadata[name];
  }
  const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (icon) icon.href = metadata.favicon;
};
