import { env } from './env';
import { snowflake } from './modules/ai';
import { DEFAULT_LANGUAGE, DEFAULT_ROUTE, URL_OPEN_TYPE, DEFAULT_COLOR, DEFAULT_BACKGROUND } from './modules/base';

// 先初始化应用配置再导出资源，避免原有页面与语言模块的循环引用影响配置读取。
export const config = Object.freeze({
  app: Object.freeze({
    defaultLanguage: DEFAULT_LANGUAGE, // 默认语言
    defaultRoute: DEFAULT_ROUTE, // 保留现有用户入口优先规则
    routerMode: env.routerMode, // 路由模式
    baseUrl: env.baseUrl, // 网站部署基础路径
    siteUrl: env.siteUrl, // 站点对外绝对地址，分享链接与 canonical 统一引用
    urlOpenType: URL_OPEN_TYPE, // 外链打开方式
    defaultColor: DEFAULT_COLOR, // 默认文字颜色
    defaultBackground: DEFAULT_BACKGROUND, // 默认背景颜色
    assetBaseUrl: env.assetBaseUrl, // 静态资源基础路径
    dev: env.dev, // 开发模式标识
    prod: env.prod, // 生产模式标识
  }), // 应用基础配置
  api: Object.freeze({
    baseUrl: env.apiBaseUrl, // 本站后端基础地址
  }), // 本站接口配置
  ai: snowflake, // 内置人工智能配置，调用方式保持不变
});
