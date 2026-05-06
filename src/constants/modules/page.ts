import { $t } from '@/locales'
import pageConfig from '@/locales/lang/zh/core.json'
import { computed } from 'vue'
import { BASE_ROUTES, MUSE_ROUTES, PROJECT_ROUTES } from './routes'
type PageType = 'project' | 'base' | 'light'

interface PageItem {
  name: string
  url: string
  desc?: string
  type: PageType
  version?: string
  icon?: any
  iconType?: string
}

/**
 * 检查是否存在描述字段
 * @param item 页面名称
 * @returns 是否存在描述字段
 */
const getRouterInfo = (item: any) => {
  const router: any = pageConfig.router
  const itemName = item.name
  const desc = router[`${itemName}Desc`]
  const name = router[`${itemName}`]
  return {
    ...item,
    desc: desc ? $t(`router.${itemName}Desc`) : undefined,
    name: name ? $t(`router.${itemName}`) : itemName,
    url: `/${itemName}`,
  }
}
/**
 * 基础路由页面列表
 * 包含所有基础路由的页面信息
 */
export const BASE_PAGE = computed<PageItem[]>(() => {
  const list = BASE_ROUTES.map((item) => ({
    type: 'base' as PageType,
    ...getRouterInfo(item),
  }))
  return list
})
/**
 * 项目路由页面列表
 * 包含所有项目路由的页面信息
 */
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
/**
 * 轻量级路由页面列表
 * 包含所有轻量级路由的页面信息
 */
export const MUSE_PAGE = computed<PageItem[]>(() => {
  const list = MUSE_ROUTES.map((item) => ({
    type: 'light' as PageType,
    ...getRouterInfo(item),
  }))
  return list
})

export const ALL_PAGE = computed<PageItem[]>(() => {
  return [...BASE_PAGE.value, ...PROJECT_PAGE.value, ...MUSE_PAGE.value]
})
