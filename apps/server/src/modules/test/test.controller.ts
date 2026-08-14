import { Controller, Get } from '@nestjs/common';

/**
 * 测试控制器
 * 用于存放临时的测试接口和演示功能
 */
@Controller('test')
export class TestController {
  constructor() {
    console.log('TestController 已加载');
  }
  /**
   * 获取今天的日期
   * 访问路径: GET /test/date
   * @returns 包含当前日期的对象
   */
  @Get('date')
  getTodayDate() {
    return {
      date: new Date().toISOString().split('T')[0], // 格式：YYYY-MM-DD
      fullDate: new Date().toLocaleString(), // 格式：本地化全日期时间
    };
  }
}
