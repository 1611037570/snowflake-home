// 预览区语言包：只服务预览文案，不依赖 vue-i18n
export type PreviewLang = "zh" | "en" | "ja" | "ko" | "fr" | "de" | "es" | "ru";

// 语言选项：切换入口直接使用本表，新增语言只需扩展这里与下方字典
export const previewLangList = [
  { name: "简体中文", value: "zh" },
  { name: "English", value: "en" },
  { name: "日本語", value: "ja" },
  { name: "한국어", value: "ko" },
  { name: "Français", value: "fr" },
  { name: "Deutsch", value: "de" },
  { name: "Español", value: "es" },
  { name: "Русский", value: "ru" },
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
  ja: {
    account: "ソーシャルアカウント",
    education: "学歴",
    skill: "スキル",
    advantage: "強み",
    work: "職歴",
    project: "プロジェクト経験",
    honor: "受賞・資格",
    video: "動画作品",
    image: "画像作品",
  },
  ko: {
    account: "소셜 계정",
    education: "학력",
    skill: "전문 기술",
    advantage: "강점",
    work: "경력",
    project: "프로젝트 경험",
    honor: "수상 및 자격증",
    video: "영상 작품",
    image: "이미지 작품",
  },
  fr: {
    account: "Comptes sociaux",
    education: "Formation",
    skill: "Compétences",
    advantage: "Atouts",
    work: "Expérience professionnelle",
    project: "Projets",
    honor: "Distinctions et certificats",
    video: "Œuvres vidéo",
    image: "Œuvres images",
  },
  de: {
    account: "Soziale Konten",
    education: "Ausbildung",
    skill: "Fähigkeiten",
    advantage: "Stärken",
    work: "Berufserfahrung",
    project: "Projekte",
    honor: "Auszeichnungen & Zertifikate",
    video: "Videowerke",
    image: "Bildwerke",
  },
  es: {
    account: "Cuentas sociales",
    education: "Educación",
    skill: "Habilidades",
    advantage: "Fortalezas",
    work: "Experiencia laboral",
    project: "Proyectos",
    honor: "Honores y certificados",
    video: "Obras de video",
    image: "Obras de imagen",
  },
  ru: {
    account: "Соцсети",
    education: "Образование",
    skill: "Навыки",
    advantage: "Сильные стороны",
    work: "Опыт работы",
    project: "Проекты",
    honor: "Награды и сертификаты",
    video: "Видеоработы",
    image: "Изображения",
  },
};

// 预览区其它界面文案（页脚、user 模块内嵌标签等）；品牌保留拼音名，不逐语言翻译
export const PREVIEW_TEXTS: Record<PreviewLang, Record<string, string>> = {
  zh: {
    brand: "轻舟简历",
    footer: "轻舟简历 · 第 {page} 页 · 共 {total} 页",
    age: "{age}岁",
    expYears: "{years}年经验",
    avatarAlt: "头像",
    phoneLabel: "电话：",
    emailLabel: "邮箱：",
    cityLabel: "期望城市：",
    nativePlaceLabel: "籍贯：",
  },
  en: {
    brand: "Qingzhou Resume",
    footer: "Qingzhou Resume · Page {page} of {total}",
    age: "{age}",
    expYears: "{years} years",
    avatarAlt: "Avatar",
    phoneLabel: "Phone: ",
    emailLabel: "Email: ",
    cityLabel: "Preferred city: ",
    nativePlaceLabel: "Native place: ",
  },
  ja: {
    brand: "Qingzhou Resume",
    footer: "Qingzhou Resume · {page} / {total} ページ",
    age: "{age}歳",
    expYears: "{years}年の経験",
    avatarAlt: "アバター",
    phoneLabel: "電話：",
    emailLabel: "メール：",
    cityLabel: "希望勤務地：",
    nativePlaceLabel: "出身地：",
  },
  ko: {
    brand: "Qingzhou Resume",
    footer: "Qingzhou Resume · {page} / {total} 페이지",
    age: "{age}세",
    expYears: "경력 {years}년",
    avatarAlt: "아바타",
    phoneLabel: "전화: ",
    emailLabel: "이메일: ",
    cityLabel: "희망 도시: ",
    nativePlaceLabel: "출신지: ",
  },
  fr: {
    brand: "Qingzhou Resume",
    footer: "Qingzhou Resume · Page {page} sur {total}",
    age: "{age} ans",
    expYears: "{years} ans d'expérience",
    avatarAlt: "Avatar",
    phoneLabel: "Tél. : ",
    emailLabel: "E-mail : ",
    cityLabel: "Ville souhaitée : ",
    nativePlaceLabel: "Lieu d’origine : ",
  },
  de: {
    brand: "Qingzhou Resume",
    footer: "Qingzhou Resume · Seite {page} von {total}",
    age: "{age} Jahre",
    expYears: "{years} Jahre Erfahrung",
    avatarAlt: "Avatar",
    phoneLabel: "Telefon: ",
    emailLabel: "E-Mail: ",
    cityLabel: "Wunschstadt: ",
    nativePlaceLabel: "Herkunftsort: ",
  },
  es: {
    brand: "Qingzhou Resume",
    footer: "Qingzhou Resume · Página {page} de {total}",
    age: "{age} años",
    expYears: "{years} años de experiencia",
    avatarAlt: "Avatar",
    phoneLabel: "Teléfono: ",
    emailLabel: "Correo: ",
    cityLabel: "Ciudad deseada: ",
    nativePlaceLabel: "Lugar de origen: ",
  },
  ru: {
    brand: "Qingzhou Resume",
    footer: "Qingzhou Resume · Страница {page} из {total}",
    age: "{age} лет",
    expYears: "Опыт {years} лет",
    avatarAlt: "Аватар",
    phoneLabel: "Телефон: ",
    emailLabel: "Почта: ",
    cityLabel: "Желаемый город: ",
    nativePlaceLabel: "Место рождения: ",
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
