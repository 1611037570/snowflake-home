import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AppService } from './app.service'

@ApiTags('系统接口')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: '服务健康检查' })
  @Get()
  ping(): string {
    return this.appService.ping()
  }
}
