import { $t } from '@/locales'
export const pageList = computed(() => {
  return [
    {
      name: $t('router.image'),
      url: '/image',
      version: '1.0.0',
    },
    {
      name: $t('router.image'),
      url: '/image1',
      version: '1.0.0',
    },
    {
      name: $t('router.resume'),
      url: '/resume',
    },
    {
      name: $t('router.messageBoard'),
      url: '/messageBoard',
    },
    {
      name: $t('router.home'),
      url: '/home',
    },
  ]
})
