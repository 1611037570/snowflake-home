// 导入依赖
import { ALL_PAGE } from '@/constants'
import { loadPageLang } from '@/locales'
import { useTitle } from '@vueuse/core'

/**
 * 路由前置守卫
 * @param to 目标路由对象
 * @param from 来源路由对象
 * @param next 路由放行函数
 */
export async function beforeEachGuard(to: any, from: any, next: any) {
  const pageName = to.name

  await loadPageLang(pageName)
  // 查找匹配的页面配置
  const pageConfig = ALL_PAGE.value.find((item) => item.url === to.path)

  if (pageConfig) {
    // 异步加载页面语言包

    // 构建页面标题
    let title = pageConfig.name
    title += pageConfig.desc ? ` - ${pageConfig.desc}` : ''
    // 更新HTML标题
    useTitle(title)
  }

  // 放行路由
  next()
}
