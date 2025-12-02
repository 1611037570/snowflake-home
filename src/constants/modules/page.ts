import { $t } from '@/locales'

type PageType = 'project' | 'base'

interface PageItem {
  name: string
  url: string
  type: PageType
  version?: string
}
export const BASE_LIST = computed<PageItem[]>(() => {
  return [
    {
      name: $t('router.index'),
      url: '/',
      type: 'base',
    },
    {
      name: $t('router.home'),
      url: '/home',
      type: 'base',
    },
    {
      name: $t('router.icon'),
      url: '/icon',
      type: 'base',
    },
    {
      name: $t('router.color'),
      url: '/color',
      type: 'base',
    },
  ]
})
export const PROJECT_LIST = computed<PageItem[]>(() => {
  return [
    {
      name: $t('router.image'),
      url: '/image',
      version: '1.0.0',
      type: 'project',
    },
    {
      name: $t('router.resume'),
      url: '/resume',
      type: 'project',
    },
    {
      name: $t('router.messageBoard'),
      url: '/messageBoard',
      type: 'project',
    },
    {
      name: $t('router.home'),
      url: '/home',
      type: 'project',
    },
    {
      name: $t('router.reborn'),
      url: '/reborn',
      type: 'project',
    },
  ]
})
export const PAGE_LIST = computed<PageItem[]>(() => {
  return [...BASE_LIST.value, ...PROJECT_LIST.value]
})
