import { $t } from '@/locales'
import pageConfig from '@/locales/lang/zh/core.json'
import { computed } from 'vue'
import { BASE_PAG_LIST, PROJECT_PAGE_LIST } from '../config'
type PageType = 'project' | 'base'

interface PageItem {
  name: string
  url: string
  desc?: string
  type: PageType
  version?: string
}

/**
 * 检查是否存在描述字段
 * @param item 页面名称
 * @returns 是否存在描述字段
 */
const getRouterInfo = (item: string) => {
  const router: any = pageConfig.router
  const desc = router[`${item}Desc`]
  const name = router[`${item}`]
  return {
    desc: desc ? $t(`router.${item}Desc`) : undefined,
    name: name ? $t(`router.${item}`) : item,
    url: `/${item}`,
  }
}

export const BASE_LIST = computed<PageItem[]>(() => {
  const list = BASE_PAG_LIST.map((item) => ({
    type: 'base' as PageType,
    ...getRouterInfo(item),
  }))
  return list
})
export const PROJECT_LIST = computed<PageItem[]>(() => {
  const list = PROJECT_PAGE_LIST.map((item) => {
    const pageItem: PageItem = {
      ...getRouterInfo(item),
      type: 'project' as PageType,
    }
    return pageItem
  })
  return list
})

export const PAGE_LIST = computed<PageItem[]>(() => {
  return [...BASE_LIST.value, ...PROJECT_LIST.value]
})
