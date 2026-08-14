import { $t } from '@/locales'
export const userInfo = computed(() => {
  return {
    name: $t('user.name'),
    location: $t('user.location'),
    job: $t('user.job'),
    devYears: '2019-11-22',
    shootYears: '2023-06-02',
  }
})
