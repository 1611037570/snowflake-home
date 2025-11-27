import type { I18n, I18nOptions } from 'vue-i18n'
import { createI18n } from 'vue-i18n' // 从 vue-i18n 导入创建实例的方法
/**
 * 获取默认语言（优先级：本地存储 > 浏览器默认）
 * @returns 语言标识（zh 或 en）
 */
const LANG_MAP: Record<string, any> = {
  // 主标识项：带 name（用于页面显示，如下拉框）
  zh: { key: 'zh', name: '简体中文' },
  en: { key: 'en', name: 'English' },
  // 别名标识项：不带 name（仅用于映射到同一核心语言）
  'zh-CN': { key: 'zh' },
  'zh-TW': { key: 'zh' },
  'en-US': { key: 'en' },
}
export const langList = Object.values(LANG_MAP).filter((item) => item.name)
function getLangKey(lang: string) {
  return LANG_MAP[lang]?.key || ''
}
const getDefaultLocale = () => {
  // 优先读本地存储
  const savedLangKey = getLangKey(localStorage.getItem('appLanguage') || '')
  if (savedLangKey) {
    return savedLangKey
  }

  // 读浏览器语言
  const browserLangKey = getLangKey(navigator.language || '')
  if (browserLangKey) {
    return browserLangKey
  }

  // 兜底返回默认语言
  const defaultLang = import.meta.env.VITE_DEFAULT_LANG
  return getLangKey(defaultLang)
}

const DEFAULT_LANG_KEY = getDefaultLocale()
// 构建语言包映射
const messages: any = {}
const langModule = await import(`./lang/${DEFAULT_LANG_KEY}/core.json`)
messages[DEFAULT_LANG_KEY] = langModule.default

// 创建 I18n 实例
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
}
const i18n: I18n = createI18n(i18nOptions)
let pageName = ''
export const loadPageLang = async (name: string) => {
  pageName = name
  const langKey = i18n.global.locale.value
  console.log(' i18n.global.locale.value', i18n.global.locale)

  // 动态导入页面专属语言包（打包时拆分为独立 chunk）
  try {
    const pageLangModule = await import(`./lang/${langKey}/${pageName}.json`)
    const pageLang = pageLangModule.default
    // 合并到全局
    i18n.global.mergeLocaleMessage(langKey, pageLang)
  } catch (error) {
    // console.error(`加载页面语言包 ${pageName}/${langKey} 失败:`, error)
    return
  }
}
// 8. 语言切换函数（优化：切换后自动重新加载当前页面语言包）
export const changeLanguage = async (key: string) => {
  const langKey = getLangKey(key)
  if (!messages[langKey]) {
    try {
      const langModule = await import(`./lang/${langKey}/core.json`)
      messages[langKey] = langModule.default
    } catch (error) {
      console.error(`加载语言包 ${langKey} 失败:`, error)
      return
    }
  }
  i18n.global.locale.value = langKey
  localStorage.setItem('appLanguage', langKey)

  if (pageName) {
    loadPageLang(pageName)
  }
}
interface Translation {
  (key: string): string
}
export const $t = i18n.global.t as Translation
export default i18n
