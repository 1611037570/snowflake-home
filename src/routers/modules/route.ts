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
  {
    path: '/image1',
    name: 'image1',
    component: () => import('@views/image1/index.vue'),
  },
  // 留言板
  {
    path: '/messageBoard',
    name: 'messageBoard',
    component: () => import('@views/messageBoard/index.vue'),
  },
  // 21天计划
  {
    path: '/21days',
    name: '21days',
    component: () => import('@views/21days/index.vue'),
  },
  // 冒泡排序
  {
    path: '/bubbleSort',
    name: 'bubbleSort',
    component: () => import('@views/sort/bubble.vue'),
  },
  {
    path: '/color',
    name: 'color',
    component: () => import('@views/color/index.vue'),
  },
  // 捕获所有不存在的路由并重定向到主页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]
export default routes
