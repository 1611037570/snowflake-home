import { $t } from '@/locales'
export const userInfo = computed(() => {
  return {
    name: $t('index.name'),
    location: $t('index.location'),
    job: $t('index.job'),
    devYears: $t('index.devYears'),
    shootYears: $t('index.shootYears'),
  }
})
