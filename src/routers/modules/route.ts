const routes = [
  // 首页 个人简历
  {
    path: '/',
    name: 'index',
    component: () => import('@views/index/index.vue'),
  },
  // 起始页
  {
    path: '/home',
    name: 'home',
    component: () => import('@views/home/index.vue'),
  },
  // 个人简历
  {
    path: '/resume',
    name: 'resume',
    component: () => import('@views/resume/index.vue'),
  },
  // 图片展示
  {
    path: '/image',
    name: 'image',
    component: () => import('@views/image/index.vue'),
  },
  // 留言板
  {
    path: '/messageBoard',
    name: 'messageBoard',
    component: () => import('@views/messageBoard/index.vue'),
  },
  // 重启人生
  {
    path: '/reborn',
    name: 'reborn',
    component: () => import('@views/reborn/index.vue'),
  },
  // 颜色选择器
  {
    path: '/color',
    name: 'color',
    component: () => import('@views/color/index.vue'),
  },
  // 图标库
  {
    path: '/icon',
    name: 'icon',
    component: () => import('@views/icon/index.vue'),
  },
  // 排序算法
  {
    path: '/sort',
    name: 'sort',
    component: () => import('@views/sort/index.vue'),
  },
  // 人生已完成清单
  {
    path: '/checklist',
    name: 'checklist',
    component: () => import('@views/checklist/index.vue'),
  },
  // 2048 游戏
  {
    path: '/2048',
    name: '2048',
    component: () => import('@views/2048/index.vue'),
  },
  // 404 错误页
  {
    path: '/error',
    name: 'error',
    component: () => import('@views/status/error.vue'),
  },
  // 捕获所有不存在的路由并重定向到主页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/error',
  },
]
export default routes
