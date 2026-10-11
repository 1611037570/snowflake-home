// 构建侧与浏览器侧共用转换规则，所有环境字段集中声明。
export function readEnvironment(source: Record<string, string | boolean | undefined>) {
  const text = (name: string, fallback = '') => String(source[name] ?? '') || fallback;
  const port = Number(text('VITE_PORT', '5173'));
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('配置 VITE_PORT 必须为有效端口');
  return Object.freeze({
    port, // 开发服务端口
    baseUrl: text('VITE_BASE_URL', '/'), // 网站部署基础路径
    siteUrl: text('VITE_SITE_URL'), // 站点对外绝对地址，用于拼接 og 卡片与站点地图；需与后端 PUBLIC_SITE_URL 保持一致
    defaultRoute: text('VITE_DEFAULT_ROUTE', '/resume'), // 默认产品入口
    defaultLanguage: text('VITE_DEFAULT_LANGUAGE', 'zh'), // 默认语言
    routerMode: text('VITE_ROUTER_MODE', 'history'), // 路由模式
    apiBaseUrl: text('VITE_SNOWFLAKE_API_URL'), // 本站后端地址，保留现有环境名称
    aiApiKey: text('VITE_AI_API_KEY'), // 内置模型密钥，本阶段仍由前端直连使用
    assetBaseUrl: text('BASE_URL', text('VITE_BASE_URL', '/')), // 构建资源基础路径
    dev: source.DEV === true, // 开发模式标识
    prod: source.PROD === true, // 生产模式标识
  });
}

// 构建工具导入本文件时可只调用转换函数，客户端在此读取环境。
export const env = readEnvironment(import.meta.env ?? {});
