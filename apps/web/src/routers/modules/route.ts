import { ALL_ROUTES, DEFAULT_ROUTE } from "@/configs";
import { type RouteRecordRaw } from "vue-router";

// 路由数组，通过模块加载路由
const routes: RouteRecordRaw[] = [
  // 默认路由，重定向到起始页
  {
    path: "/",
    redirect: DEFAULT_ROUTE,
  },
  // 404 错误页
  {
    path: "/error",
    name: "error",
    component: () => import("@views/status/error.vue"),
  },
  // 捕获所有不存在的路由并重定向
  {
    path: "/:pathMatch(.*)*",
    redirect: "/error",
  },
];

// 动态导入所有视图组件，优化路径匹配
const componentModules = import.meta.glob("@/views/*/index.vue", { eager: false });
// 简历页子路由：顶部导航板块
const resumeChildren: RouteRecordRaw[] = [
  { path: "", name: "resume", component: () => import("@/views/resume/main/index.vue") },
  { path: "template", component: () => import("@/views/resume/template/index.vue") },
  // 公开范本使用独立详情地址，刷新时由静态网页直接承载正文。
  { path: "example/:slug", component: () => import("@/views/resume/seo/exampleDetail.vue") },
  // 我的简历页内嵌导入流程，预览按编辑器字段契约展示模块与字段名，需一并加载编辑器语言包
  { path: "mine", component: () => import("@/views/resume/mine/index.vue"), meta: { localeFiles: ["resume", "resume-editor"] } },
  { path: "ai", component: () => import("@/views/resume/settings/ai/index.vue") },
  // 用户自己的使用记录，与首页固定展示数据分开。
  { path: "ai-usage", component: () => import("@/views/resume/aiUsage/index.vue") },
  // AI 生成简历使用独立页面，复用弹窗入口的同一套生成流程。
  { path: "generate", component: () => import("@/views/resume/generate/index.vue") },
  // 优化页选择简历，执行与报告由工作台和编辑器共用的弹窗承接。
  { path: "optimize", component: () => import("@/views/resume/optimize/index.vue"), meta: { localeFiles: ["resume", "resume-editor"] } },
  // 面试独立于简历编辑器，使用自己的流程与持久化记录。
  { path: "interview", component: () => import("@/views/resume/interview/index.vue") },
  { path: "statistics", component: () => import("@/views/resume/statistics/index.vue") },
  { path: "guide", component: () => import("@/views/resume/guide/index.vue") },
  // 求职工具从指南拆出独立入口，两个页面各自收录。
  { path: "tools", component: () => import("@/views/resume/tools/index.vue") },
  // 离职决策评分作为求职工具二级页面单独按需加载。
  {
    path: "tools/resignation-score",
    component: () => import("@/views/resume/guide/resignationScore/index.vue"),
  },
  // Offer 对比决策器作为求职工具二级页面单独按需加载。
  {
    path: "tools/offer-comparison",
    component: () => import("@/views/resume/guide/offerComparison/index.vue"),
  },
  // 真实时薪计算器作为求职工具二级页面单独按需加载。
  {
    path: "tools/real-hourly-wage",
    component: () => import("@/views/resume/guide/realHourlyWage/index.vue"),
  },
  // 工具页原挂在指南下的旧路径，保留重定向，避免已收录链接失效。
  { path: "guide/resignation-score", redirect: "/resume/tools/resignation-score" },
  { path: "guide/offer-comparison", redirect: "/resume/tools/offer-comparison" },
  { path: "guide/real-hourly-wage", redirect: "/resume/tools/real-hourly-wage" },
  // 通用设置页复用编辑器的备份文案与目录授权键，需一并加载编辑器语言包
  {
    path: "settings",
    component: () => import("@/views/resume/settings/general/index.vue"),
    meta: { localeFiles: ["resume", "resume-editor"] },
  },
  {
    path: "editor",
    name: "editor",
    component: () => import("@/views/resume/editor/index.vue"),
    meta: { hideResumeLayout: true, localeFiles: ["resume", "resume-editor"] },
  },
  {
    path: "print",
    name: "resume-print",
    component: () => import("@/views/resume/print/index.vue"),
    meta: { hideResumeLayout: true },
  },
];
/**
 * 路由映射表
 * @property {string} path 路由路径
 * @property {string} value 组件文件名
 */
// 添加路由函数，根据组件名称动态创建路由
function generateRoute(item: any): RouteRecordRaw {
  const name = item.name;
  // 动态生成组件导入路径，确保正确匹配
  const componentPath = `/src/views/${name}/index.vue`;
  const component = componentModules[componentPath];

  // 简历页为布局路由：父路由不设 name，保留页面标识供子路由复用
  const isResume = name === "resume";
  const defaultRoute = {
    ...(!isResume ? { name } : {}),
    path: `/${name}`,
    component: component ? component : () => import("@views/status/error.vue"),
    ...(isResume ? { meta: { pageName: name, localeFiles: [name] } } : {}),
  };
  return {
    ...defaultRoute,
    ...(isResume ? { children: resumeChildren } : {}),
  };
}
// 生成并添加所有页面路由
const list = ALL_ROUTES.map((item) => generateRoute(item));
routes.push(...list);

export default routes;
