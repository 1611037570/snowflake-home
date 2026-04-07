import { $t } from '@/locales'
export const userInfo = computed(() => {
  return {
    name: $t('user.name'),
    location: $t('user.location'),
    job: $t('user.job'),
    devYears: $t('user.devYears'),
    shootYears: $t('user.shootYears'),
  }
})
