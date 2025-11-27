import i18n from '@/locales'
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

export async function loadElLocale() {
  const map: Record<string, any> = {
    zh: await import('element-plus/es/locale/lang/zh-cn'),
    en: await import('element-plus/es/locale/lang/en'),
  }
  const currentLocale: any = getCurrentLocale()
  return currentLocale.value ? map[currentLocale.value] : map['zh']
}
