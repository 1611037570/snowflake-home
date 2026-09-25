import { ALL_PAGE } from "@/configs";
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
  fallbackLocale: "zh", // 英文缺失字段回退到中文
  messages, // 语言包映射
  missingWarn: false, // 关闭缺失键警告
  fallbackWarn: false, // 关闭后备键警告
};
const i18n: I18n = createI18n(i18nOptions);

interface LocaleRoute {
  meta?: {
    localeFile?: unknown;
    pageName?: unknown;
  };
  name?: unknown;
}

export function getPageLocaleFile(route: LocaleRoute): string {
  const pageName = route.meta?.localeFile || route.meta?.pageName || route.name;
  return typeof pageName === "string" ? pageName : "";
}

type LocaleMessage = Record<string, any>;

const localeMessageCache = new Map<string, LocaleMessage | null>();
const localeMessageLoading = new Map<string, Promise<LocaleMessage | null>>();

async function dynamicLoadPageLang(name: string, langKey: string): Promise<LocaleMessage | null> {
  const cacheKey = `${langKey}/${name}`;
  if (localeMessageCache.has(cacheKey)) {
    return localeMessageCache.get(cacheKey) || null;
  }
  const loadingMessage = localeMessageLoading.get(cacheKey);
  if (loadingMessage) {
    return loadingMessage;
  }

  const loading = import(`./lang/${langKey}/${name}.json`)
    .then((pageLangModule) => {
      const pageLang = pageLangModule.default as LocaleMessage;
      localeMessageCache.set(cacheKey, pageLang);
      return pageLang;
    })
    .catch((error) => {
      localeMessageCache.set(cacheKey, null);
      if (import.meta.env.DEV) {
        console.warn(`[i18n] 加载语言包失败: ${langKey}/${name}.json`, error);
      }
      return null;
    })
    .finally(() => {
      localeMessageLoading.delete(cacheKey);
    });

  localeMessageLoading.set(cacheKey, loading);
  return loading;
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
  const coreMessage = (await dynamicLoadPageLang("core", langKey)) || {};
  const pageMessage = (await dynamicLoadPageLang(name, langKey)) || {};
  // 每次只保留核心语言和当前页面语言
  i18n.global.setLocaleMessage(langKey, {
    core: coreMessage.core || {},
    ...pageMessage,
  });
  // 加载标题
  await dynamicLoadPageTitle(name);
};

// 导出翻译函数
export const $t = i18n.global.t as Translation;

// 导出 i18n 实例
export default i18n;
