// 导入 Vue Router 核心函数
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
// 导入路由配置
import routes from './modules/route'
// 导入语言包加载函数
import { loadPageLang } from '@/locales'
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

router.beforeEach(async (to, from, next) => {
  const pageName = to.name as string
  if (pageName) {
    // 路由切换时，加载当前页面的语言包（等待加载完成再进入页面）
    await loadPageLang(pageName)
  }
  next() // 加载完成后放行路由
})

// 导出路由实例
export default router
