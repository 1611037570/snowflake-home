import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Action } from '../entities/action.entity'
import { Visitor } from '../entities/visitor.entity'
import { StatsController } from './stats.controller'
import { StatsService } from './stats.service'

@Module({
  // 指定 resume 数据源，避免简历实体被注册到基础库
  imports: [TypeOrmModule.forFeature([Visitor, Action], 'resume')],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
