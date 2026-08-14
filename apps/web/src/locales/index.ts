import { ALL_PAGE } from "@/constants";
import { useTitle } from "@vueuse/core";
import type { I18n, I18nOptions } from "vue-i18n";
import { createI18n } from "vue-i18n"; // 从 vue-i18n 导入创建实例的方法

import type { LangItem, Translation } from "./types";

export const LANG_LIST: LangItem[] = [
  { key: "zh", name: "简体中文", value: "zh" },
  { key: "en", name: "English", value: "en" },
  // 别名标识项：不带 name（仅用于映射到同一核心语言）
  { key: "zh", value: "zh-CN" },
  { key: "zh", value: "zh-TW" },
  { key: "en", value: "en-US" },
];
function getLangKey(lang: string): string {
  // 直接查找value匹配的项，拿到对应的核心key
  const matchItem = LANG_LIST.find((item) => item.value === lang);
  return matchItem?.key || "";
}
// 获取默认语言
const getDefaultLocale = () => {
  // 优先读本地存储
  const savedLangKey = getLangKey(localStorage.getItem("snowflakeLanguage") || "");
  if (savedLangKey) {
    return savedLangKey;
  }

  // 读浏览器语言
  const browserLangKey = getLangKey(navigator.language || "");
  if (browserLangKey) {
    return browserLangKey;
  }

  // 兜底返回默认语言
  const defaultLang = import.meta.env.VITE_DEFAULT_LANGUAGE;
  return getLangKey(defaultLang);
};

const DEFAULT_LANG_KEY = getDefaultLocale();
// 构建语言包映射
const messages: any = {};

/**
 * i18n 配置选项
 */
const i18nOptions: I18nOptions = {
  legacy: false, // 启用组合式 API 模式
  globalInjection: true, // 全局注入 $t 函数
  locale: DEFAULT_LANG_KEY, // 设置默认语言
  messages, // 语言包映射
  missingWarn: false, // 关闭缺失键警告
  fallbackWarn: false, // 关闭后备键警告
};
const i18n: I18n = createI18n(i18nOptions);

async function dynamicLoadPageLang(name: string, langKey: string) {
  try {
    const pageLangModule = await import(`./lang/${langKey}/${name}.json`);
    const pageLang = pageLangModule.default;
    // 合并到全局
    i18n.global.mergeLocaleMessage(langKey, pageLang);
    return pageLang;
  } catch (error) {
    console.error(`加载 ${name}的${langKey} 包失败:`, error);
    return;
  }
}

function loadDefaultTitle() {
  useTitle(import.meta.env.VITE_APP_TITLE);
}
async function dynamicLoadPageTitle(pageName: string) {
  const pageConfig: any = ALL_PAGE.value.find((item) => item.url === `/${pageName}`);
  if (!pageConfig) {
    loadDefaultTitle();
    return;
  }
  const name = pageConfig.name;
  let title = name && !name.startsWith("router.") ? name : "";
  if (!title) {
    loadDefaultTitle();
    return;
  }
  const desc = pageConfig.desc;
  title += desc && !desc.startsWith("router.") ? ` - ${desc}` : "";
  useTitle(title);
}
export const loadPageLang = async (name: string, langKey?: string) => {
  langKey = (langKey || i18n.global.locale.value) as string;
  // 更新语言
  i18n.global.locale.value = langKey;
  localStorage.setItem("snowflakeLanguage", langKey);
  // 加载核心语言包
  await dynamicLoadPageLang("core", langKey);
  // 加载标题
  await dynamicLoadPageTitle(name);
  // 加载页面专属语言包
  await dynamicLoadPageLang(name, langKey);
};

// 导出翻译函数
export const $t = i18n.global.t as Translation;

// 导出 i18n 实例
export default i18n;
