import { env } from "../configs/env"
export const baseConfig = {
  // 应用配置
  app: {
    // 服务名称
    name: '雪花服务',
    // 端口号
    port: 3000,
    // JSON请求体最大限制
    bodyLimit: '50mb',
    // 跨域配置
    cors: {
      origin: '*',
    },
  },
  // PDF渲染页面配置
  pdf: {
    renderUrl: env.pdfRenderUrl, // 打印页面地址
    timeout: env.pdfTimeout, // 页面渲染超时，单位毫秒
  },
  // 数据库配置
  mysql: {
    // 数据库类型
    type: 'mysql' as const,
    // 数据库主机
    host: 'localhost',
    // 数据库端口
    port: 3306,
    // 数据库用户名
    username: 'root',
    // 数据库密码
    password: env.mainPassword,
    // 数据库名称
    database: 'snowflake_home',
    // 自动同步实体到数据库表结构（开发环境开启，生产环境建议关闭）
    synchronize: true,
  },
  // Redis 配置
  redis: {
    host: 'localhost',
    port: 6379,
    password: env.redisPassword, // 从环境读取缓存密码
    db: 0,
  },
  // MongoDB 配置
  mongodb: {
    host: 'localhost',
    port: 27017,
    database: 'snowflake_home',
    username: '',
    password: env.mongoPassword, // 从环境读取文档数据库密码
  },
  // JWT 配置
  jwt: {
    // JWT 密钥
    secret: env.jwtSecret,
    // 过期时间
    expiresIn: '24h',
  },
}
