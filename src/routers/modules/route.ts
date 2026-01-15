import { ALL_PAGE_LIST, DEFAULT_PAGE } from '@/constants/modules/config'

// 路由数组，通过模块加载路由
const routes: any[] = [
  // 默认路由，重定向到起始页
  {
    path: '/',
    redirect: `/${DEFAULT_PAGE}`,
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
// 动态导入所有视图组件
const components = import.meta.glob('@/views/*/index.vue', { eager: false })
// 获取组件函数，根据组件名称动态导入组件
function getComponent(name: string) {
  return components[`/src/views/${name}/index.vue`]
}
// 添加路由函数，根据组件名称动态创建路由
function addRoute(name: string) {
  return {
    path: `/${name}`,
    name: name,
    component: getComponent(name),
  }
}
// 按需加载路由
routes.push(...ALL_PAGE_LIST.map((name) => addRoute(name)))

export default routes
