import { ALL_ROUTES, DEFAULT_ROUTE } from '@/constants'
import { type RouteRecordRaw } from 'vue-router'

// 路由数组，通过模块加载路由
const routes: RouteRecordRaw[] = [
  // 默认路由，重定向到起始页
  {
    path: '/',
    redirect: DEFAULT_ROUTE,
  },
  // 404 错误页
  {
    path: '/error',
    name: 'error',
    component: () => import('@views/status/error.vue'),
  },
  // 捕获所有不存在的路由并重定向
  {
    path: '/:pathMatch(.*)*',
    redirect: '/error',
  },
]

// 动态导入所有视图组件，优化路径匹配
const componentModules = import.meta.glob('@/views/*/index.vue', { eager: false })
/**
 * 路由映射表
 * @property {string} path 路由路径
 * @property {string} value 组件文件名
 */
// 添加路由函数，根据组件名称动态创建路由
function generateRoute(name: string): RouteRecordRaw {
  // 动态生成组件导入路径，确保正确匹配
  const componentPath = `/src/views/${name}/index.vue`
  const component = componentModules[componentPath]

  return {
    path: `/${name}`,
    name,
    component: component ? component : () => import('@views/status/error.vue'),
  }
}
// 生成并添加所有页面路由
const list = ALL_ROUTES.map((item) => generateRoute(item))
routes.push(...list)

export default routes
