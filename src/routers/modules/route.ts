import { PAGE_ALL_LIST } from '@/constants/modules/config'
// 路由配置对象
const routeConfigs: Record<string, any> = {
  // 个人简历
  index: {
    path: '/index',
    name: 'index',
    component: () => import('@views/index/index.vue'),
  },
  // 起始页
  home: {
    path: '/home',
    name: 'home',
    component: () => import('@views/home/index.vue'),
  },
  // 个人简历
  resume: {
    path: '/resume',
    name: 'resume',
    component: () => import('@views/resume/index.vue'),
  },
  // 图片展示
  image: {
    path: '/image',
    name: 'image',
    component: () => import('@views/image/index.vue'),
  },
  // 留言板
  messageBoard: {
    path: '/messageBoard',
    name: 'messageBoard',
    component: () => import('@views/messageBoard/index.vue'),
  },
  // 重启人生
  reborn: {
    path: '/reborn',
    name: 'reborn',
    component: () => import('@views/reborn/index.vue'),
  },
  // 颜色选择器
  color: {
    path: '/color',
    name: 'color',
    component: () => import('@views/color/index.vue'),
  },
  // 图标库
  icon: {
    path: '/icon',
    name: 'icon',
    component: () => import('@views/icon/index.vue'),
  },
  // 排序算法
  sort: {
    path: '/sort',
    name: 'sort',
    component: () => import('@views/sort/index.vue'),
  },
  // 人生已完成清单
  checklist: {
    path: '/checklist',
    name: 'checklist',
    component: () => import('@views/checklist/index.vue'),
  },
  // 2048 游戏
  '2048': {
    path: '/2048',
    name: '2048',
    component: () => import('@views/2048/index.vue'),
  },
  // 404 错误页
  error: {
    path: '/error',
    name: 'error',
    component: () => import('@views/status/error.vue'),
  },
  // 密码箱
  passwordBox: {
    path: '/passwordBox',
    name: 'passwordBox',
    component: () => import('@views/passwordBox/index.vue'),
  },
  // 便签
  note: {
    path: '/note',
    name: 'note',
    component: () => import('@views/note/index.vue'),
  },
  // 捕获所有不存在的路由并重定向
  wildcard: {
    path: '/:pathMatch(.*)*',
    redirect: '/error',
  },
}

// 默认空数组，通过模块加载路由
const routes = [
  // 默认路由，重定向到起始页
  {
    path: '/',
    redirect: '/home',
  },
  // 捕获所有不存在的路由并重定向
  {
    path: '/:pathMatch(.*)*',
    redirect: '/error',
  },
]
// 按需加载路由
routes.push(...PAGE_ALL_LIST.map((name) => routeConfigs[name]))

export default routes
