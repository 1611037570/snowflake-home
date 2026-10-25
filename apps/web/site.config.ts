/** 全站统一的站点图标，避免每条路由重复声明。 */
const FAVICON = "/favicon.ico";

export interface CatalogCounts {
  exampleCount: number; // 已登记的简历范本数量。
  templateCount: number; // 已登记的排版模板数量。
}

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
    noindex: true, // 雪花起始页脱离简历域名收录范围，不再进入 sitemap
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
        title: "免费在线简历制作 - 简历模板与 PDF 下载 | 轻舟简历",
        description:
          "使用轻舟简历免费在线创建与编辑简历，支持简历模板、AI 生成、内容优化以及 PDF、图片和 Markdown 下载；无需注册，导出无水印。",
        keywords:
          "在线简历制作,免费简历制作,简历模板,PDF简历下载,在线简历生成器,无水印简历,轻舟简历,Skiff Resume",
      },
      en: {
        title: "Free Online Resume Builder - Resume Templates and PDF Download | Skiff Resume",
        description:
          "Create and edit a resume online for free with resume templates, AI drafting and content improvement, then download it as PDF, images or Markdown without signing up or adding a watermark.",
        keywords:
          "free online resume builder,resume templates,PDF resume download,online resume maker,no watermark resume,Skiff Resume,轻舟简历",
      },
    },
  },
  {
    route: "/resume/template",
    changefreq: "weekly",
    priority: 0.9,
    locales: {
      zh: {
        title: "免费简历模板与范本 - 在线编辑与 ATS 排版 | 轻舟简历",
        description:
          "浏览 {exampleCount} 份简历范本和 {templateCount} 种排版模板，按岗位与场景挑选内容范本，或选择适合 ATS 投递的简洁单栏样式；在线编辑并导出 PDF。",
        keywords: "简历范本,简历模板,ATS简历模板,免费简历模板,简历模板下载,校招简历范本,实习简历范本",
      },
      en: {
        title: "Free Resume Templates and Examples - ATS-Friendly Layouts | Skiff Resume",
        description:
          "Browse {exampleCount} resume examples and {templateCount} layout templates. Pick a role-based example or a clear single-column layout for ATS applications, edit online and export to PDF.",
        keywords:
          "resume examples,resume templates,ATS resume templates,free resume templates,campus resume examples,internship resume examples",
      },
    },
  },
  {
    route: "/resume/ai",
    changefreq: "monthly",
    priority: 0.8,
    locales: {
      zh: {
        title: "AI 简历优化 - 简历润色、生成与岗位匹配 | 轻舟简历",
        description:
          "使用轻舟 AI 生成和优化简历内容，支持经历润色、简历评估、目标岗位匹配、多语言翻译与模拟面试，可结合当前简历直接修改。",
        keywords: "AI简历优化,简历润色,AI简历生成,简历修改,岗位匹配,简历评分,模拟面试,轻舟简历",
      },
      en: {
        title: "AI Resume Optimization - Rewrite, Generate and Match Jobs | Skiff Resume",
        description:
          "Generate and improve resume content with Skiff AI, including experience rewrites, resume reviews, job matching, translation and mock interview practice.",
        keywords: "AI resume optimization,resume rewriter,AI resume generator,resume review,job matching,mock interview,Skiff Resume",
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
    route: "/resume/guide",
    changefreq: "monthly",
    priority: 0.8,
    locales: {
      zh: {
        title: "求职指南 - 简历制作、面试与入职避坑 | 轻舟简历",
        description:
          "轻舟简历求职指南汇总简历制作、岗位投递、选岗谈薪、面试准备、入职与离职避坑等关键内容，帮助求职者高效完成求职流程。",
        keywords: "求职指南,简历怎么写,应届生求职,投递简历,选岗技巧,谈薪技巧,面试技巧,入职注意事项,离职注意事项",
      },
      en: {
        title: "Job Search Guide - Resume, Interview and Offer Advice | Skiff Resume",
        description:
          "Practical guidance on resumes, applications, job selection, salary discussions, interviews, onboarding and resignations.",
        keywords: "job search guide,resume writing,job applications,offer comparison,salary negotiation,interview tips,onboarding,resignation advice",
      },
    },
  },
  {
    route: "/resume/guide/resignation-score",
    changefreq: "monthly",
    priority: 0.8,
    locales: {
      zh: {
        title: "离职决策快速评分 - 10 项工作去留自测 | 轻舟简历",
        description:
          "通过收入、年终奖、五险一金、通勤、加班、休假、下班边界、职场氛围、成长和健康十项评分，1 分钟判断当前工作是否值得继续。",
        keywords: "离职决策,离职测试,工作去留,裸辞评估,工作满意度,职业选择,离职评分表",
      },
      en: {
        title: "Resignation Decision Score - 10-Item Job Assessment | Skiff Resume",
        description:
          "Assess pay, benefits, commute, overtime, time off, boundaries, workplace culture, growth and health to decide whether your current job is worth keeping.",
        keywords: "resignation decision,job assessment,quit job test,career decision,job satisfaction",
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
  counts: CatalogCounts, // 构建或运行时从实际清单取得的范本与模板数量。
): SiteMetadata => {
  const site = pickSite(path) || pickSite(entryRoute) || SITE_CONFIGS[0]!;
  const localized = site.locales[language.startsWith("en") ? "en" : "zh"];
  const fillCounts = (value: string) =>
    value
      .replaceAll("{exampleCount}", String(counts.exampleCount))
      .replaceAll("{templateCount}", String(counts.templateCount));
  return {
    ...localized,
    title: fillCounts(localized.title),
    description: fillCounts(localized.description),
    favicon: FAVICON,
    noindex: site.noindex ?? false,
  };
};
