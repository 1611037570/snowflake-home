import { Controller, Post, Body, Res } from '@nestjs/common'
import type { Response } from 'express'
import { LLMService } from './llm.service'

@Controller('llm')
export class LLMController {
  constructor(private readonly llmService: LLMService) {}

  @Post('stream')
  async chatStream(@Body() data: any, @Res() res: Response) {
    try {
      // 获取上游原始响应
      const upstreamRes = await this.llmService.getUpstreamResponse(data)

      if (!upstreamRes.ok) {
        const errorText = await upstreamRes.text()
        return res.status(upstreamRes.status).send(errorText)
      }

      if (!upstreamRes.body) {
        throw new Error('上游响应体为空')
      }

      // 1. 获取上游返回的 Content-Type（确保如果上游报错返回 JSON，我们也能正确透传）
      const contentType = upstreamRes.headers.get('content-type') || 'text/event-stream'

      // 2. 设置必要的响应头
      res.status(200)
      res.setHeader('Content-Type', contentType)
      res.setHeader('Cache-Control', 'no-cache, no-transform')
      res.setHeader('Connection', 'keep-alive')
      // 关键：告诉中间代理（如 Nginx）不要缓存，直接透传流
      res.setHeader('X-Accel-Buffering', 'no')
      res.flushHeaders() // 立即发送头部

      // 3. 直接将字节流透传给前端
      const reader = upstreamRes.body.getReader()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        console.log('yes value')

        res.write(value) // 直接写入原始字节块，不处理数据
      }

      res.end()
    } catch (error) {
      console.error('中转流出错:', error)
      if (!res.headersSent) {
        res.status(500).send(error.message)
      }
    }
  }
}
