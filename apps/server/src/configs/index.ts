import { baseConfig } from '../config/base.config'
import { resumeConfig } from '../modules/resume/resume.config'
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
})
