import i18n from '@/locales'
import('element-plus/es/locale/lang/zh-cn')
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
  const currentLocale: any = getCurrentLocale()
  return currentLocale.value
}
