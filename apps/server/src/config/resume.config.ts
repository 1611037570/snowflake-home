import { env } from '../configs/env'

// 简历库配置：连接参数全部取自环境变量，真实值只落在不入库的 apps/server/.env.local
export const resumeConfig = {
  // 简历库数据库配置（与基础库相互独立）
  mysql: {
    // 数据库类型
    type: 'mysql' as const,
    // 数据库主机
    host: env.resumeDbHost,
    // 数据库端口
    port: env.resumeDbPort,
    // 数据库用户名
    username: env.resumeDbUsername,
    // 数据库密码
    password: env.resumeDbPassword,
    // 数据库名称
    database: env.resumeDbDatabase,
    // 自动同步实体到数据库表结构（开发环境开启，生产环境建议关闭）
    synchronize: true,
  },
}
