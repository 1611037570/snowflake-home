import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { DemoService } from './demo.service'
import { CreateDemoDto } from './demo.dto'

@ApiTags('Demo 示例')
@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  /**
   * 最简单 GET 接口（无参数）
   * 访问: GET /demo/ping
   */
  @ApiOperation({ summary: '无参数接口' })
  @Get('ping')
  ping() {
    return this.demoService.ping()
  }

  /**
   * 带查询参数的 GET 接口
   * 访问: GET /demo/hello?name=张三
   */
  @ApiOperation({ summary: '查询参数接口' })
  @Get('hello')
  hello(@Query('name') name: string) {
    return this.demoService.hello(name)
  }

  /**
   * 带路径参数的 GET 接口
   * 访问: GET /demo/detail/1001
   */
  @ApiOperation({ summary: '路径参数接口' })
  @Get('detail/:id')
  getDetail(@Param('id') id: string) {
    return this.demoService.getDetail(id)
  }

  /**
   * 带请求体参数的 POST 接口
   * 访问: POST /demo/create
   */
  @ApiOperation({ summary: '请求体参数接口' })
  @Post('create')
  create(@Body() createDemoDto: CreateDemoDto) {
    return this.demoService.create(createDemoDto)
  }
}
