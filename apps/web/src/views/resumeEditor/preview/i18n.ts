// 预览区模块标题语言包：只服务预览标题，不依赖 vue-i18n
export type PreviewLang = "zh" | "en";

// 语言选项：供预览区语言切换使用
export const previewLangList = [
  { name: "简体中文", value: "zh" },
  { name: "English", value: "en" },
];

// 按语言组织的模块标题字典
export const PREVIEW_TITLES: Record<PreviewLang, Record<string, string>> = {
  zh: {
    account: "社交账号",
    education: "教育经历",
    skill: "专业技能",
    advantage: "个人优势",
    work: "工作经历",
    project: "项目经历",
    honor: "荣誉证书",
    video: "视频作品",
    image: "图片作品",
  },
  en: {
    account: "Social Accounts",
    education: "Education",
    skill: "Skills",
    advantage: "Strengths",
    work: "Work Experience",
    project: "Projects",
    honor: "Honors & Certificates",
    video: "Video Works",
    image: "Image Works",
  },
};

// 预览区其它界面文案（页脚、user 模块内嵌标签等）
export const PREVIEW_TEXTS: Record<PreviewLang, Record<string, string>> = {
  zh: {
    brand: "轻舟简历",
    footer: "轻舟简历 · 第 {page} 页 · 共 {total} 页",
    age: "{age}岁",
    expYears: "{years}年经验",
    avatarAlt: "头像",
    phoneLabel: "电话：",
    emailLabel: "邮箱：",
  },
  en: {
    brand: "Qingzhou Resume",
    footer: "Qingzhou Resume · Page {page} of {total}",
    age: "{age} years old",
    expYears: "{years} years of experience",
    avatarAlt: "Avatar",
    phoneLabel: "Phone: ",
    emailLabel: "Email: ",
  },
};

// 取预览文案并替换 {变量}
export function getPreviewText(key: string, lang: string, vars: Record<string, any> = {}) {
  const texts = PREVIEW_TEXTS[lang as PreviewLang] || PREVIEW_TEXTS.zh;
  const text = texts[key] ?? PREVIEW_TEXTS.zh[key] ?? "";
  return text.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ""));
}

// 取模块标题：语言缺失时回退中文，仍缺失返回空串
export function getPreviewTitle(moduleKey: string, lang: string) {
  const titles = PREVIEW_TITLES[lang as PreviewLang] || PREVIEW_TITLES.zh;
  return titles[moduleKey] || PREVIEW_TITLES.zh[moduleKey] || "";
}
