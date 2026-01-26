import type { I18n, I18nOptions } from 'vue-i18n'
import { createI18n } from 'vue-i18n' // 从 vue-i18n 导入创建实例的方法
interface LangItem {
  // 最终要使用的语言
  key: string
  // 语言显示名称
  name?: string
  // 语言匹配值
  value: string
}
export const LANG_LIST: LangItem[] = [
  { key: 'zh', name: '简体中文', value: 'zh' },
  { key: 'en', name: 'English', value: 'en' },
  // 别名标识项：不带 name（仅用于映射到同一核心语言）
  { key: 'zh', value: 'zh-CN' },
  { key: 'zh', value: 'zh-TW' },
  { key: 'en', value: 'en-US' },
]

function getLangKey(lang: string): string {
  // 直接查找value匹配的项，拿到对应的核心key
  const matchItem = LANG_LIST.find((item) => item.value === lang)
  return matchItem?.key || ''
}
// 获取默认语言
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

  // 动态导入页面专属语言包（打包时拆分为独立 chunk）
  try {
    const pageLangModule = await import(`./lang/${langKey}/${pageName}.json`)
    const pageLang = pageLangModule.default
    // 合并到全局
    i18n.global.mergeLocaleMessage(langKey, pageLang)
  } catch (error) {
    console.error(`加载页面语言包 ${pageName}/${langKey} 失败:`, error)
    return
  }
}
// 8. 语言切换函数（优化：切换后自动重新加载当前页面语言包）
export const changeLanguage = async (key: string) => {
  const langKey = getLangKey(key)
  if (!messages[langKey]) {
    loadPageLang('core')
  }
  i18n.global.locale.value = langKey
  localStorage.setItem('appLanguage', langKey)

  if (pageName) {
    loadPageLang(pageName)
  }
}
changeLanguage(DEFAULT_LANG_KEY)
interface Translation {
  (key: string): string
}
// 导出翻译函数
export const $t = i18n.global.t as Translation
// 导出 i18n 实例
export default i18n
