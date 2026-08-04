// 导入 Vue Router 核心函数
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
// 导入路由配置
import { beforeEachGuard } from './guards'
import routes from './modules/route'

// 根据环境变量确定路由模式
const routerMode = import.meta.env.VITE_ROUTER_MODE
// 动态选择创建历史记录的方法
const createHistory = routerMode === 'hash' ? createWebHashHistory : createWebHistory

// 创建路由实例
const router = createRouter({
  // 设置路由历史记录模式和基础路径
  history: createHistory(import.meta.env.VITE_BASE_URL),
  // 配置路由规则
  routes,
})

router.beforeEach(beforeEachGuard)

// 导出路由实例
export default router
