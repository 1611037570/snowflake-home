import { loadPageLang } from '@/locales'
import { useSystemStore } from '@/stores'

/**
 * 路由前置守卫
 * @param to 目标路由对象
 * @param from 来源路由对象
 * @param next 路由放行函数
 */
export async function beforeEachGuard(to: any, from: any, next: any) {
  const systemStore = useSystemStore()
  systemStore.checkVersionUpdate()
  const pageName = to.name
  await loadPageLang(pageName)
  // 放行路由
  next()
}
