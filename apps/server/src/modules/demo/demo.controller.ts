import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { DemoService } from './demo.service'
import { CreateDemoDto } from './demo.dto'

@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  /**
   * 最简单 GET 接口（无参数）
   * 访问: GET /demo/ping
   */
  @Get('ping')
  ping() {
    return this.demoService.ping()
  }

  /**
   * 带查询参数的 GET 接口
   * 访问: GET /demo/hello?name=张三
   */
  @Get('hello')
  hello(@Query('name') name: string) {
    return this.demoService.hello(name)
  }

  /**
   * 带路径参数的 GET 接口
   * 访问: GET /demo/detail/1001
   */
  @Get('detail/:id')
  getDetail(@Param('id') id: string) {
    return this.demoService.getDetail(id)
  }

  /**
   * 带请求体参数的 POST 接口
   * 访问: POST /demo/create
   */
  @Post('create')
  create(@Body() createDemoDto: CreateDemoDto) {
    return this.demoService.create(createDemoDto)
  }
}
