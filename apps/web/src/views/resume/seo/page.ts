import { resolveSiteConfig, resolveSiteMetadata, type CatalogCounts } from "../../../../site.config";
import { publicExamples } from "./catalog";

export interface SeoMetaTag {
  /** 标签使用名称属性还是开放图谱属性。 */
  attribute: "name" | "property";
  /** 标签的唯一名称。 */
  key: string;
  /** 标签的实际内容。 */
  content: string;
}

// 规范路径、标签及结构化数据统一生成，静态响应与浏览器导航不再各自维护规则。
export function resolvePageSeo(path: string, language: string, entryRoute: string, counts: CatalogCounts, origin: string) {
  const route = path.split(/[?#]/)[0]!.replace(/\/+$/, "") || entryRoute;
  const base = origin.replace(/\/+$/, "");
  const metadata = resolveSiteMetadata(route, language, entryRoute, counts);
  const config = resolveSiteConfig(route);
  const exact = config?.route === route;
  const content = exact ? config?.content : undefined;
  const url = `${base}${route}`;
  const robots = metadata.noindex ? "noindex,follow" : "index,follow";
  const tags: SeoMetaTag[] = [
    { attribute: "name", key: "description", content: metadata.description },
    { attribute: "name", key: "keywords", content: metadata.keywords },
    { attribute: "name", key: "robots", content: robots },
    { attribute: "property", key: "og:type", content: "website" },
    { attribute: "property", key: "og:site_name", content: "轻舟简历" },
    { attribute: "property", key: "og:title", content: metadata.title },
    { attribute: "property", key: "og:description", content: metadata.description },
    { attribute: "property", key: "og:url", content: url },
    { attribute: "property", key: "og:image", content: `${base}/og-image.png` },
    { attribute: "name", key: "twitter:card", content: "summary_large_image" },
    { attribute: "name", key: "twitter:title", content: metadata.title },
    { attribute: "name", key: "twitter:description", content: metadata.description },
    { attribute: "name", key: "twitter:image", content: `${base}/og-image.png` },
  ];
  // 面包屑沿页面配置逐级解析，文案直接复用页面标题。
  const parents: string[] = [];
  let parent = exact ? config?.parentRoute : undefined;
  while (parent) {
    if (parents.includes(parent) || parent === route) throw new Error(`页面上级配置循环：${route}`);
    parents.unshift(parent);
    const parentConfig = resolveSiteConfig(parent);
    if (parentConfig?.route !== parent) throw new Error(`页面上级未登记：${parent}`);
    parent = parentConfig.parentRoute;
  }
  const schemaType = exact ? config?.schemaType ?? "WebPage" : "WebPage";
  const application = schemaType === "SoftwareApplication" || schemaType === "WebApplication";
  const schema = {
    "@context": "https://schema.org", // 结构化数据词汇表。
    "@graph": [ // 组织、页面、层级和目录的关系集合。
      {
        "@type": "Organization", // 产品所属组织类型。
        "@id": `${base}/#organization`, // 组织统一标识。
        name: "轻舟简历", // 中文品牌名称。
        alternateName: "Skiff Resume", // 英文品牌名称。
        url: `${base}/resume`, // 产品首页地址。
      },
      {
        "@type": schemaType, // 由页面配置决定的类型。
        name: metadata.title, // 页面标题。
        description: metadata.description, // 页面摘要。
        url, // 页面规范地址。
        inLanguage: language.startsWith("en") ? "en" : "zh-CN", // 页面声明语言。
        ...(application ? {
          applicationCategory: config?.applicationCategory ?? "BusinessApplication", // 应用用途。
          operatingSystem: "Web", // 应用运行平台。
          offers: { // 免费使用信息。
            "@type": "Offer", // 价格声明类型。
            price: "0", // 使用价格。
            priceCurrency: "CNY", // 价格币种。
          },
        } : {}),
      },
      ...(parents.length ? [{
        "@type": "BreadcrumbList", // 页面层级导航类型。
        itemListElement: [...parents, route].map((item, index) => ({
          "@type": "ListItem", // 导航项类型。
          position: index + 1, // 从首页开始的顺序。
          name: resolveSiteMetadata(item, language, entryRoute, counts).title.split(" - ")[0], // 复用页面主标题。
          item: `${base}${item}`, // 导航目标地址。
        })),
      }] : []),
      ...(content === "catalog" ? [{
        "@type": "ItemList", // 页面可见的范本目录类型。
        itemListElement: publicExamples.map((item, index) => ({
          "@type": "ListItem", // 目录项类型。
          position: index + 1, // 范本在目录中的顺序。
          name: item.name, // 范本名称。
          url: `${base}${item.path}`, // 范本详情地址。
        })),
      }] : []),
    ],
  };
  return {
    metadata, // 已解析的页面标题、摘要和收录属性。
    path: route, // 去除查询参数与末尾斜杠的路径。
    url, // 页面规范地址。
    language: language.startsWith("en") ? "en" : "zh-CN", // 网页语言。
    content, // 当前配置声明的静态正文来源。
    tags, // 构建和浏览器共用的头部标签。
    schema, // 构建和浏览器共用的结构化数据。
  };
}
