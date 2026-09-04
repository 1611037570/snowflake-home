import { loadPageLang } from "@/locales";
// 版本检测已注释，暂不引入 useSystemStore
// import { useSystemStore } from "@/stores";

/**
 * 路由前置守卫
 * @param to 目标路由对象
 * @param from 来源路由对象
 * @param next 路由放行函数
 */
export async function beforeEachGuard(to: any, from: any, next: any) {
  // 根据当前页面加载对应语言包，路由名称不存在时使用默认起始页兜底
  const pageName = to.name;
  // 语言包后台加载，不阻塞路由放行，避免线上跳转停顿
  loadPageLang(pageName);

  // 每次进入页面前检查系统版本状态
  // 暂时注释掉版本检测，避免版本检查阻塞路由跳转
  // const systemStore = useSystemStore();
  // systemStore.checkVersionUpdate();

  // 放行路由
  next();
}
