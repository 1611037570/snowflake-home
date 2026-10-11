/** 全站统一的站点图标，避免每条路由重复声明。 */
const FAVICON = "/favicon.ico";

/** 单个语言的页面信息。 */
interface LocaleMetadata {
  /** 浏览器标签标题。 */
  title: string;
  /** 页面内容描述。 */
  description: string;
  /** 页面检索关键词。 */
  keywords: string;
}

/** 产品路由及其收录属性。 */
interface SiteConfig {
  /** 页面路径，子路由可单独配置以覆盖产品默认信息。 */
  route: string;
  /** 是否禁止搜索引擎收录：工具页与用户私有页需要设为 true。 */
  noindex?: boolean;
  /** 站点地图里的更新频率提示。 */
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  /** 站点地图里的优先级，取值 0.0 到 1.0。 */
  priority?: number;
  /** 中文与英文页面信息。 */
  locales: Record<"zh" | "en", LocaleMetadata>;
}

/** 解析后的页面信息：在语言信息基础上补上全站统一字段与收录标记。 */
interface SiteMetadata extends LocaleMetadata {
  /** 网站图标地址。 */
  favicon: string;
  /** 是否禁止搜索引擎收录。 */
  noindex: boolean;
}

/** 产品入口与可独立收录的子页面信息，子页面单独维护标题描述以避免整站共用一套元数据。 */
export const SITE_CONFIGS: SiteConfig[] = [
  {
    route: "/home",
    changefreq: "monthly",
    priority: 0.5,
    locales: {
      zh: {
        title: "雪花起始页 - 如雪纯净的浏览器起点",
        description: "雪花起始页——小巧的浏览器起始页",
        keywords: "雪花起始页,浏览器起始页,极简起始页,工具箱",
      },
      en: {
        title: "Snowflake Start Page",
        description: "A clean and compact browser start page.",
        keywords: "Snowflake,browser start page,start page,toolbox",
      },
    },
  },
  {
    route: "/resume",
    changefreq: "weekly",
    priority: 1.0,
    locales: {
      zh: {
        title: "轻舟简历 - 免费在线简历制作，免注册导出PDF模板",
        description:
          "轻舟简历是一款免费的在线简历制作工具，内置多套专业模板，支持在线编辑、AI 智能优化、Markdown 与 PDF 一键导出，无需注册登录，浏览器打开即用。",
        keywords:
          "轻舟简历,Skiff Resume,免费简历,免费简历模板,在线简历制作,简历生成器,AI简历,简历编辑器,简历模板下载,导出PDF简历",
      },
      en: {
        title: "Skiff Resume - Free Online Resume Builder and Templates",
        description:
          "Skiff Resume is a free online resume builder with ready-made templates. Edit online, improve with AI, and export to Markdown or PDF without signing up.",
        keywords:
          "Skiff Resume,轻舟简历,free resume builder,free resume templates,online resume maker,resume generator,AI resume,resume editor,export resume PDF",
      },
    },
  },
  {
    route: "/resume/template",
    changefreq: "weekly",
    priority: 0.9,
    locales: {
      zh: {
        title: "免费简历模板 - 在线套用范本并导出 PDF | 轻舟简历",
        description:
          "轻舟简历提供多套免费简历模板，覆盖互联网、金融、教育等行业以及校招、实习、留学等场景，选中即可在线编辑并导出 PDF，无需注册。",
        keywords: "简历模板,免费简历模板,简历模板下载,个人简历模板,校招简历模板,实习简历模板,留学简历模板",
      },
      en: {
        title: "Free Resume Templates - Customize Online and Export PDF | Skiff Resume",
        description:
          "Browse free resume templates for tech, finance and education roles, covering campus, internship and study-abroad cases. Pick one, edit online and export to PDF without signing up.",
        keywords:
          "resume templates,free resume templates,resume template download,campus resume template,internship resume template",
      },
    },
  },
  {
    route: "/resume/ai",
    changefreq: "monthly",
    priority: 0.8,
    locales: {
      zh: {
        title: "AI 简历优化 - 智能润色与模拟面试 | 轻舟简历",
        description:
          "小舟 AI 助手可一键润色简历表达、生成经历描述、对标目标岗位 JD 做匹配分析，并提供自我介绍与逐轮模拟面试练习。",
        keywords: "AI简历,AI简历优化,简历润色,简历生成,JD对标,模拟面试",
      },
      en: {
        title: "AI Resume Optimization - Rewrite and Mock Interviews | Skiff Resume",
        description:
          "Skiff AI polishes your resume wording, drafts experience bullet points, matches the resume against a target job description, and runs mock interview practice.",
        keywords: "AI resume,resume optimization,resume rewriter,job description match,mock interview",
      },
    },
  },
  {
    route: "/resume/statistics",
    changefreq: "monthly",
    priority: 0.7,
    locales: {
      zh: {
        title: "求职投递统计 - 记录投递进度与 offer | 轻舟简历",
        description: "记录每一次投递、跟进、面试与 offer 状态，用趋势图看清投递节奏，支持批量录入并安排后续跟进。",
        keywords: "求职统计,投递记录,面试跟进,offer管理,求职进度,投递趋势",
      },
      en: {
        title: "Job Application Tracker - Log Progress and Offers | Skiff Resume",
        description:
          "Log every application, follow-up, interview and offer, review application trends, and add records in batches with follow-up reminders.",
        keywords: "job application tracker,application log,interview follow-up,offer tracking",
      },
    },
  },
  {
    route: "/resume/editor",
    noindex: true,
    locales: {
      zh: {
        title: "简历编辑器 - 轻舟简历",
        description: "在线编辑简历的工作台页面，不参与搜索引擎收录。",
        keywords: "轻舟简历,简历编辑器",
      },
      en: {
        title: "Resume Editor - Skiff Resume",
        description: "The resume editing workspace, excluded from search engine indexing.",
        keywords: "Skiff Resume,resume editor",
      },
    },
  },
  {
    route: "/resume/print",
    noindex: true,
    locales: {
      zh: {
        title: "简历打印预览 - 轻舟简历",
        description: "服务端导出 PDF 使用的打印预览页面，不参与搜索引擎收录。",
        keywords: "轻舟简历,简历打印",
      },
      en: {
        title: "Resume Print Preview - Skiff Resume",
        description: "The print preview page used for server-side PDF export, excluded from search engine indexing.",
        keywords: "Skiff Resume,resume print",
      },
    },
  },
  {
    route: "/resume/mine",
    noindex: true,
    locales: {
      zh: {
        title: "我的简历 - 轻舟简历",
        description: "管理本地简历草稿的个人页面，不参与搜索引擎收录。",
        keywords: "轻舟简历,我的简历",
      },
      en: {
        title: "My Resumes - Skiff Resume",
        description: "The private page for managing local resume drafts, excluded from search engine indexing.",
        keywords: "Skiff Resume,my resumes",
      },
    },
  },
];

// 路径命中判断：允许带子路径、查询串或哈希。
const matchesRoute = (route: string, value: string) =>
  value === route || value.startsWith(`${route}/`) || value.startsWith(`${route}?`) || value.startsWith(`${route}#`);

// 同一路径会同时命中产品入口与子页面两条配置，取路径最长的一条，子页面才能覆盖产品默认信息。
const pickSite = (value: string): SiteConfig | undefined =>
  SITE_CONFIGS.filter((item) => matchesRoute(item.route, value)).reduce<SiteConfig | undefined>(
    (longest, item) => (!longest || item.route.length > longest.route.length ? item : longest),
    undefined,
  );

// 按最长路径段选择页面，其他页面沿用初始入口的默认产品信息。
export const resolveSiteMetadata = (
  path: string,
  language: string,
  /** 初始入口路由，由调用方从环境变量传入 */
  entryRoute: string,
): SiteMetadata => {
  const site = pickSite(path) || pickSite(entryRoute) || SITE_CONFIGS[0]!;
  return {
    ...site.locales[language.startsWith("en") ? "en" : "zh"],
    favicon: FAVICON,
    noindex: site.noindex ?? false,
  };
};
