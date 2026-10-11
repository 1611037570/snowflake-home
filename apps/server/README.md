# @snowflake/server

基于 NestJS 的服务端应用。

## 配置入口

- 两端统一使用 `src/configs/index.ts` 作为应用配置入口，读取 `config`（应用配置对象）；保留现有配置模块和资源位置。
- 环境读取集中在 `src/configs/env.ts`；实际值写入被忽略的分环境文件 `.env.{运行环境}`，`.env.example` 只保留字段说明和空值。
- 环境在数据库探测和服务创建前加载；系统/pm2 环境变量优先于 `.env.{运行环境}`。
