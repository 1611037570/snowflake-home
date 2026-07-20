import { DEFAULT_LANGUAGE } from '@/constants'
import i18n from '@/locales'
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import('element-plus/es/locale/lang/zh-cn')

// 语言配置对象
const langConfig: any = {
  'zh-CN': zhCn,
  en: en,
}

// 当前的语言
const language = ref(DEFAULT_LANGUAGE)
// 获取当前语言
export function getCurrentLocale() {
  const currentLocale: any = ref({})
  watch(
    () => i18n.global.locale.value,
    async (newLocale) => {
      currentLocale.value = newLocale
    },
    { immediate: true },
  )
  return currentLocale
}

// 加载element-plus的locale
onMounted(async () => {
  language.value = await getCurrentLocale()
})

// 根据语言键获取配置，不存在则使用默认语言
export const getElLocale = computed(() => langConfig[language.value || DEFAULT_LANGUAGE])
