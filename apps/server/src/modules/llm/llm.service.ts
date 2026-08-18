import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface DeepSeekBalance {
  is_available: boolean
  balance_infos: Array<{
    currency: string
    total_balance: string
    granted_balance: string
    topped_up_balance: string
  }>
}

@Injectable()
export class LLMService {
  constructor(private configService: ConfigService) {}

  /**
   * 获取上游 AI 服务的原始响应
   */
  async getUpstreamResponse(data: any) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')
    const baseURL = this.configService.get<string>('OPENAI_BASE_URL')
    const url = `${baseURL}`
    console.log('url:', url)
    console.log('data:', data)
    const obj = {
      model: 'deepseek-v4-flash-ga-260731',
      stream: true, // 关键：必须告诉上游返回流式数据
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_image',
              image_url:
                'https://ark-project.tos-cn-beijing.volces.com/doc_image/ark_demo_img_1.png',
            },
            {
              type: 'input_text',
              text: '你看见了什么？',
            },
          ],
        },
      ],
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        ...data,
        stream: true,
      }),
    })
    // // 检查HTTP响应状态
    // if (!response.ok) {
    //   throw new Error(`请求失败`);
    // }
    // // 检查响应体是否存在
    // if (!response.body) {
    //   throw new Error("响应体为空，无法读取流式数据");
    // }
    // const reader = response.body.getReader();

    // while (true) {
    //   const { done, value } = await reader.read();
    //   if (done) {
    //     return response;
    //   }
    //   // res.write(value); // 直接写入原始字节块，不处理数据
    // }

    return response
  }

  /**
   * 查询 DeepSeek 余额
   */
  async getBalance() {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')
    const url = 'https://api.deepseek.com/user/balance'
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
    const data = (await response.json()) as DeepSeekBalance
    return data
  }
}
