import { Injectable } from '@nestjs/common'
import { config } from '../../configs'

@Injectable()
export class LLMService {

  /**
   * 获取上游 AI 服务的原始响应
   */
  async getUpstreamResponse(data: any) {
    const apiKey = config.ai.apiKey
    const baseURL = config.ai.baseUrl
    // 模型名称由服务端配置控制，前端传入值不会生效
    const model = config.ai.model
    const url = `${baseURL}`
    console.log('url:', url)
    console.log('data:', data)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        ...data,
        model,
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

}
