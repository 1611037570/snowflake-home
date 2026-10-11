/** 独立产品的页面信息。 */
interface SiteMetadata {
  /** 浏览器标签标题。 */
  title: string;
  /** 页面内容描述。 */
  description: string;
  /** 页面检索关键词。 */
  keywords: string;
  /** 网站图标地址。 */
  favicon: string;
}

/** 产品路由与各语言的默认页面信息。 */
interface SiteConfig {
  /** 产品入口路径，子路由继承相同产品信息。 */
  route: string;
  /** 中文与英文页面信息。 */
  locales: Record<"zh" | "en", SiteMetadata>;
}

/** 首页与简历分别维护的产品信息。 */
export const SITE_CONFIGS: SiteConfig[] = [
  {
    route: "/home", // 起始页入口
    locales: { // 起始页各语言的页面信息
      zh: { // 中文页面信息
        title: "雪花起始页 - 如雪纯净的浏览器起点", // 标签标题
        description: "雪花起始页——小巧的浏览器起始页", // 页面描述
        keywords: "雪花起始页,浏览器起始页,极简起始页,工具箱", // 检索关键词
        favicon: "/favicon.ico", // 网站图标
      },
      en: { // 英文页面信息
        title: "Snowflake Start Page", // 标签标题
        description: "A clean and compact browser start page.", // 页面描述
        keywords: "Snowflake,browser start page,start page,toolbox", // 检索关键词
        favicon: "/favicon.ico", // 网站图标
      },
    },
  },
  {
    route: "/resume", // 简历产品入口
    locales: { // 简历产品各语言的页面信息
      zh: { // 中文页面信息
        title: "轻舟简历 - 免费在线简历制作，免注册导出PDF模板", // 标签标题
        description: "轻舟简历是一款免费的在线简历制作工具，内置多套专业模板，支持在线编辑、AI 智能优化、Markdown 与 PDF 一键导出，无需注册登录，浏览器打开即用。", // 页面描述
        keywords: "轻舟简历,免费简历,免费简历模板,在线简历制作,简历生成器,AI简历,简历编辑器,简历模板下载,导出PDF简历", // 检索关键词
        favicon: "/favicon.ico", // 网站图标
      },
      en: { // 英文页面信息
        title: "Skiff Resume - Free Online Resume Builder and Templates", // 标签标题
        description: "Skiff Resume is a free online resume builder with ready-made templates. Edit online, improve with AI, and export to Markdown or PDF without signing up.", // 页面描述
        keywords: "Skiff Resume,free resume builder,free resume templates,online resume maker,resume generator,AI resume,resume editor,export resume PDF", // 检索关键词
        favicon: "/favicon.ico", // 网站图标
      },
    },
  },
];

// 按完整路径段选择产品，其他页面沿用初始入口的默认产品信息。
export const resolveSiteMetadata = (
  path: string,
  language: string,
  /** 初始入口路由，由调用方从环境变量传入 */
  entryRoute: string,
): SiteMetadata => {
  const matches = (route: string, value: string) =>
    value === route || value.startsWith(`${route}/`) || value.startsWith(`${route}?`) || value.startsWith(`${route}#`);
  const site = SITE_CONFIGS.find((item) => matches(item.route, path)) ||
    SITE_CONFIGS.find((item) => matches(item.route, entryRoute)) || SITE_CONFIGS[0]!;
  return site.locales[language.startsWith("en") ? "en" : "zh"];
};
