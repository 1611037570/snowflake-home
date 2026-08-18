import { Controller, Get, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UtilsService } from './utils.service'

@ApiTags('工具接口')
@Controller('utils')
export class UtilsController {
  constructor(private readonly utilsService: UtilsService) {}

  /**
   * 获取字符串拼音的接口
   * 访问路径: GET /utils/pinyin?text=你好
   * @param text 待转换的字符串
   * @returns 拼音结果
   */
  @ApiOperation({ summary: '获取字符串拼音' })
  @Get('pinyin')
  getPinyin(@Query('text') text: string) {
    const result = this.utilsService.convertToPinyin(text)
    return {
      original: text,
      pinyin: result,
    }
  }
}
