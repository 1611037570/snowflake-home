// NestFactory 用于创建Nest应用实例
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ExpressAdapter } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { json } from 'express' // 引入express
import { baseConfig } from './config/base.config'

async function bootstrap() {
  console.log(`🚀 ${baseConfig.app.name}启动中`)

  // 创建Nest应用实例
  const app = await NestFactory.create(AppModule, new ExpressAdapter())
  // 启用全局参数验证
  app.useGlobalPipes(new ValidationPipe())
  // 允许处理JSON请求体上限
  app.use(json({ limit: baseConfig.app.bodyLimit }))
  // 开启跨域请求
  app.enableCors(baseConfig.app.cors)
  // Swagger 接口文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle(baseConfig.app.name)
    .setDescription('接口文档')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('docs', app, document)
  // 监听端口
  await app.listen(baseConfig.app.port)
  // 打印日志
  console.log(`✅ ${baseConfig.app.name}启动成功`)
  console.log(`🔗 服务地址: http://localhost:${baseConfig.app.port}`)
  console.log(`📖 接口文档: http://localhost:${baseConfig.app.port}/docs`)
}
// 启动应用
bootstrap()
