import { baseConfig } from '../config/base.config'
import { resumeConfig } from '../config/resume.config'
import { env } from './env'

// 业务统一读取本入口，保留原有配置文件和模块行为。
export const config = Object.freeze({
  app: baseConfig.app, // 服务基础配置
  database: Object.freeze({
    main: baseConfig.mysql, // 主业务数据库连接
    resume: resumeConfig.mysql, // 简历数据库连接
  }), // 数据库配置
  redis: baseConfig.redis, // 缓存连接配置
  mongodb: baseConfig.mongodb, // 文档数据库连接配置
  jwt: baseConfig.jwt, // 登录凭证配置
  pdf: baseConfig.pdf, // 文档渲染配置
  ai: Object.freeze({
    apiKey: env.aiApiKey, // 人工智能上游密钥
    baseUrl: env.aiBaseUrl, // 人工智能上游地址
    model: env.aiModel, // 人工智能上游模型
  }), // 服务端人工智能配置，接口行为不变
  integrations: Object.freeze({
    timeout: env.integrationsTimeout, // 第三方上游统一超时
    weather: Object.freeze({
      baseUrl: env.weatherBaseUrl, // 天气上游基地址
      appId: env.weatherAppId, // 天气上游应用标识
      appSecret: env.weatherAppSecret, // 天气上游应用密钥
    }), // 天气查询配置
    hotList: Object.freeze({
      baseUrl: env.hotListBaseUrl, // 热榜上游基地址
      categories: env.hotListCategories, // 热榜支持的分类白名单
    }), // 热榜查询配置
    search: Object.freeze({
      baseUrl: env.searchBaseUrl, // 搜索上游基地址
    }), // 搜索查询配置
    github: Object.freeze({
      repository: env.githubRepository, // 开源仓库全名
      starsCacheTtl: env.githubStarsCacheTtl, // 星标缓存有效期
    }), // 仓库星标配置
  }), // 第三方集成配置，上游地址与凭据不暴露给浏览器
})
