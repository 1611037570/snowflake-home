import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadEnvFile } from 'node:process'

// 在配置创建与数据库探测之前加载环境，部署参数优先于本地文件。
const directory = existsSync(resolve(process.cwd(), 'apps/server/package.json'))
  ? resolve(process.cwd(), 'apps/server')
  : process.cwd()
for (const filename of ['.env.local', '.env']) {
  const path = resolve(directory, filename)
  if (existsSync(path)) loadEnvFile(path)
}

export function envString(name: string, fallback = ''): string {
  return process.env[name] || fallback
}

export function envNumber(name: string, fallback: number): number {
  const value = Number(envString(name, String(fallback)))
  if (!Number.isInteger(value) || value < 0) throw new Error(`配置 ${name} 必须为非负整数`)
  return value
}

// 逗号分隔的配置转为列表，空段不计入结果。
export function envList(name: string, fallback = ''): string[] {
  return envString(name, fallback)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export const env = Object.freeze({
  mainPassword: envString('DB_MAIN_PASSWORD'), // 主数据库密码
  resumePassword: envString('DB_RESUME_PASSWORD'), // 简历数据库密码
  redisPassword: envString('REDIS_PASSWORD'), // 缓存密码
  mongoPassword: envString('MONGODB_PASSWORD'), // 文档数据库密码
  jwtSecret: envString('JWT_SECRET'), // 登录凭证签名密钥
  aiApiKey: envString('OPENAI_API_KEY'), // 人工智能上游密钥
  aiBaseUrl: envString('OPENAI_BASE_URL'), // 人工智能上游完整地址
  aiModel: envString('OPENAI_MODEL', 'deepseek-v4-flash-ga-260731'), // 人工智能上游模型
  pdfRenderUrl: envString('PDF_RENDER_URL', 'http://localhost:5173/resume/print'), // 打印页面地址
  pdfTimeout: envNumber('PDF_RENDER_TIMEOUT', 60000), // 打印页面渲染超时，单位毫秒
  weatherBaseUrl: envString('WEATHER_BASE_URL'), // 天气上游基地址
  weatherAppId: envString('WEATHER_APP_ID'), // 天气上游应用标识
  weatherAppSecret: envString('WEATHER_APP_SECRET'), // 天气上游应用密钥
  hotListBaseUrl: envString('HOT_LIST_BASE_URL'), // 热榜上游基地址
  hotListCategories: envList('HOT_LIST_CATEGORIES', 'douyin,zhihu,weibo,baidu,toutiao'), // 热榜支持的分类白名单
  searchBaseUrl: envString('SEARCH_BASE_URL'), // 搜索上游基地址
  githubRepository: envString('GITHUB_REPOSITORY', '1611037570/snowflake-home'), // 开源仓库全名，用于查询星标
  githubStarsCacheTtl: envNumber('GITHUB_STARS_CACHE_TTL', 1800000), // 仓库星标缓存有效期，单位毫秒
  integrationsTimeout: envNumber('INTEGRATIONS_TIMEOUT', 5000), // 第三方上游超时，单位毫秒
});
