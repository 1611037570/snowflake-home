import { loadPageLang } from '@/locales'
import { useSystemStore } from '@/stores'

/**
 * 路由前置守卫
 * @param to 目标路由对象
 * @param from 来源路由对象
 * @param next 路由放行函数
 */
export async function beforeEachGuard(to: any, from: any, next: any) {
  // 用户未设置默认起始页时，先进入初始化页进行选择
  const defaultRoute = localStorage.getItem('snowflakeRoute')
  if (!defaultRoute) {
    // 已经在初始化页时直接放行，避免重复重定向
    if (to.name === 'init') {
      next()
      return
    }
    next({ name: 'init' })
    return
  }

  // 每次进入页面前检查系统版本状态
  const systemStore = useSystemStore()
  systemStore.checkVersionUpdate()

  // 根据当前页面加载对应语言包，路由名称不存在时使用默认起始页兜底
  const pageName = to.name || defaultRoute
  await loadPageLang(pageName)

  // 放行路由
  next()
}
