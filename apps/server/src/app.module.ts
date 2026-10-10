import { DynamicModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DemoModule } from './modules/demo/demo.module'
import { LLMModule } from './modules/llm/llm.module'
import { UtilsModule } from './modules/utils/utils.module'
import { UserModule } from './modules/user/user.module'
import { FeedbackModule } from './modules/feedback/feedback.module'
import { RedisModule } from './shared/redis/redis.module'
import { RsaModule } from './shared/rsa/rsa.module'
import { config } from './configs'
import { PdfModule } from './modules/resume/pdf/pdf.module'
import { StatsModule } from './modules/resume/stats/stats.module'
import { Action } from './modules/resume/entities/action.entity'
import { Visitor } from './modules/resume/entities/visitor.entity'

@Module({
  imports: [
    // RedisModule,
    // RsaModule,
    DemoModule,
    LLMModule,
    UtilsModule,
    PdfModule,
    // UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  // 基础库与简历库分别探测，任一不可用只关闭对应模块，不影响其他服务
  static register(databaseEnabled: boolean, resumeDatabaseEnabled: boolean): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ...(databaseEnabled
          ? [
              TypeOrmModule.forRoot({
                ...config.database.main,
                autoLoadEntities: true,
              }),
              FeedbackModule,
            ]
          : []),
        ...(resumeDatabaseEnabled
          ? [
              // 简历库是独立数据源，显式列出实体避免把基础库实体也建进去
              TypeOrmModule.forRoot({
                name: 'resume',
                ...config.database.resume,
                entities: [Visitor, Action],
              }),
              StatsModule,
            ]
          : []),
      ],
    }
  }
}
