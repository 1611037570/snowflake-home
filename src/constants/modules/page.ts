import { $t } from '@/locales'
import pageConfig from '@/locales/lang/zh/core.json'
import { computed } from 'vue'
import { BASE_ROUTES, PROJECT_ROUTES } from '../config'
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

export const BASE_PAGE = computed<PageItem[]>(() => {
  const list = BASE_ROUTES.map((item) => ({
    type: 'base' as PageType,
    ...getRouterInfo(item),
  }))
  return list
})
export const PROJECT_PAGE = computed<PageItem[]>(() => {
  const list = PROJECT_ROUTES.map((item) => {
    const pageItem: PageItem = {
      ...getRouterInfo(item),
      type: 'project' as PageType,
    }
    return pageItem
  })
  return list
})

export const ALL_PAGE = computed<PageItem[]>(() => {
  return [...BASE_PAGE.value, ...PROJECT_PAGE.value]
})
