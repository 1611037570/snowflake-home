import { $t } from '@/locales'
import { PAGE_BASE_LIST, PAGE_PROJECT_LIST } from './config'
type PageType = 'project' | 'base'

interface PageItem {
  name: string
  url: string
  desc?: string
  type: PageType
  version?: string
}
export const BASE_LIST = computed<PageItem[]>(() => {
  const list = PAGE_BASE_LIST.map((item) => ({
    name: $t(`router.${item}`),
    url: `/${item}`,
    type: 'base' as PageType,
  }))
  return list
})
export const PROJECT_LIST = computed<PageItem[]>(() => {
  const list = PAGE_PROJECT_LIST.map((item) => ({
    name: $t(`router.${item}`),
    url: `/${item}`,
    type: 'project' as PageType,
    desc: $t(`router.${item}Desc`),
  }))
  return list
})
export const PAGE_LIST = computed<PageItem[]>(() => {
  return [...BASE_LIST.value, ...PROJECT_LIST.value]
})
