// 简历模块配置示例：仅作字段说明参考，实际生效配置见同目录下已入库的 resume.config.ts。
export const resumeConfig = {
  // 简历库数据库配置（与基础库相互独立）
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
    password: 'root',
    // 数据库名称
    database: 'snowflake_resume',
    // 自动同步实体到数据库表结构（开发环境开启，生产环境建议关闭）
    synchronize: true,
  },
}
