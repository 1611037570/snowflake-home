import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadEnvFile } from 'node:process'

// 运行环境标识，未显式指定时按本地开发处理
const mode = process.env.NODE_ENV || 'development'

// 在配置创建与数据库探测之前按运行环境加载分环境文件，系统/pm2 环境变量优先于文件。
// 优先级：系统/pm2 环境变量 > .env.{运行环境}（分环境，不入库，仅本地与部署机存在）
const directory = existsSync(resolve(process.cwd(), 'apps/server/package.json'))
  ? resolve(process.cwd(), 'apps/server')
  : process.cwd()
const envPath = resolve(directory, `.env.${mode}`)
if (existsSync(envPath)) loadEnvFile(envPath)

export function envString(name: string, fallback = ''): string {
  return process.env[name] || fallback
}

// 必填配置缺失时立即报错，避免静默回落到本地地址导致线上行为异常
export function envStringRequired(name: string): string {
  const value = envString(name)
  if (!value) throw new Error(`缺少必需配置 ${name}，请在 apps/server/.env.${mode} 中补充`)
  return value
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
  // 简历库连接参数，真实值只写入不入库的分环境文件 .env.{运行环境}
  resumeDbHost: envStringRequired('DB_RESUME_HOST'), // 简历数据库主机
  resumeDbPort: envNumber('DB_RESUME_PORT', 3306), // 简历数据库端口
  resumeDbUsername: envStringRequired('DB_RESUME_USERNAME'), // 简历数据库用户名
  resumeDbPassword: envStringRequired('DB_RESUME_PASSWORD'), // 简历数据库密码
  resumeDbDatabase: envStringRequired('DB_RESUME_DATABASE'), // 简历数据库名称
  redisPassword: envString('REDIS_PASSWORD'), // 缓存密码
  mongoPassword: envString('MONGODB_PASSWORD'), // 文档数据库密码
  jwtSecret: envString('JWT_SECRET'), // 登录凭证签名密钥
  aiApiKey: envString('OPENAI_API_KEY'), // 人工智能上游密钥
  aiBaseUrl: envString('OPENAI_BASE_URL'), // 人工智能上游完整地址
  aiModel: envStringRequired('OPENAI_MODEL'), // 人工智能上游模型
  // 打印页面地址，优先取显式配置，留空则由站点根地址拼接固定路由 /resume/print
  pdfRenderUrl:
    envString('PDF_RENDER_URL') || `${envStringRequired('PUBLIC_SITE_URL')}/resume/print`,
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
})
