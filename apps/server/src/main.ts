// NestFactory 用于创建Nest应用实例
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ExpressAdapter } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { json } from 'express' // 引入express
import { config } from './configs'
import mysql from 'mysql2/promise'

// 数据库不可用时只关闭数据库模块，不阻塞核心服务启动。
async function checkDatabaseConnection() {
  const connection = await mysql.createConnection({
    host: config.database.main.host,
    port: config.database.main.port,
    user: config.database.main.username,
    password: config.database.main.password,
    database: config.database.main.database,
    connectTimeout: 1500,
  })
  await connection.end()
}

// 简历库不可用时只关闭简历统计模块，不阻塞核心服务启动。
async function checkResumeDatabaseConnection() {
  const connection = await mysql.createConnection({
    host: config.database.resume.host,
    port: config.database.resume.port,
    user: config.database.resume.username,
    password: config.database.resume.password,
    database: config.database.resume.database,
    connectTimeout: 1500,
  })
  await connection.end()
}

async function bootstrap() {
  console.log(`🚀 ${config.app.name}启动中`)

  let databaseEnabled = true
  try {
    await checkDatabaseConnection()
  } catch (error) {
    databaseEnabled = false
    const message = error instanceof Error ? error.message : String(error)
    console.warn('数据库不可用，已跳过数据库模块，核心服务继续启动', message)
  }

  let resumeDatabaseEnabled = true
  try {
    await checkResumeDatabaseConnection()
  } catch (error) {
    resumeDatabaseEnabled = false
    const message = error instanceof Error ? error.message : String(error)
    console.warn('简历数据库不可用，已跳过简历统计模块，核心服务继续启动', message)
  }

  // 创建Nest应用实例
  const app = await NestFactory.create(
    AppModule.register(databaseEnabled, resumeDatabaseEnabled),
    new ExpressAdapter(),
  )
  // 启用全局参数验证
  app.useGlobalPipes(new ValidationPipe())
  // 允许处理JSON请求体上限
  app.use(json({ limit: config.app.bodyLimit }))
  // 开启跨域请求
  app.enableCors(config.app.cors)
  // Swagger 接口文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle(config.app.name)
    .setDescription('接口文档')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('docs', app, document)
  // 监听端口
  await app.listen(config.app.port)
  // 打印日志
  console.log(`✅ ${config.app.name}启动成功`)
  console.log(`🔗 服务地址: http://localhost:${config.app.port}`)
  console.log(`📖 接口文档: http://localhost:${config.app.port}/docs`)
}
// 启动应用
bootstrap()
