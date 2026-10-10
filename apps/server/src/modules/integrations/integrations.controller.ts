import { BadRequestException, Controller, Get, Query, Req } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { IntegrationsService } from './integrations.service'

@ApiTags('第三方集成')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  // 参数与上游异常统一转成请求失败，错误信息里不含上游地址与凭据
  private async run(task: Promise<unknown>) {
    try {
      return await task
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : '第三方服务不可用')
    }
  }

  @ApiOperation({ summary: '查询访问者地址' })
  @Get('ip')
  getVisitorIp(@Req() request: Request) {
    return this.integrationsService.getVisitorIp(request)
  }

  @ApiOperation({ summary: '查询城市天气' })
  @Get('weather')
  getWeather(@Query('city') city: string) {
    return this.run(this.integrationsService.getWeather(city))
  }

  @ApiOperation({ summary: '查询热榜' })
  @Get('hot-list')
  getHotList(@Query('category') category: string) {
    return this.run(this.integrationsService.getHotList(category))
  }

  @ApiOperation({ summary: '查询搜索结果' })
  @Get('search')
  getSearch(@Query('q') keyword: string) {
    return this.run(this.integrationsService.getSearch(keyword))
  }

  @ApiOperation({ summary: '查询开源仓库星标' })
  @Get('github/stars')
  getGithubStars() {
    return this.run(this.integrationsService.getGithubStars())
  }
}
