import { Module } from '@nestjs/common'
import { DemoController } from './demo.controller'
import { DemoService } from './demo.service'

@Module({
  controllers: [DemoController],
  providers: [DemoService],
})
export class DemoModule {}
