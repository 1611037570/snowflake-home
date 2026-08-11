import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { LLMModule } from './modules/llm/llm.module'
import { UtilsModule } from './modules/utils/utils.module'
import { UserModule } from './modules/user/user.module'
import { RedisModule } from './shared/redis/redis.module'
import { RsaModule } from './shared/rsa/rsa.module'
import { baseConfig } from './config/base.config'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // 全局配置
    // TypeOrmModule.forRoot({
    //   ...baseConfig.mysql,
    //   autoLoadEntities: true,
    // }),
    // RedisModule,
    // RsaModule,
    LLMModule,
    UtilsModule,
    // UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
