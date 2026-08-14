import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LLMService {
  constructor(private configService: ConfigService) { }

  /**
   * 获取上游 AI 服务的原始响应
   */
  async getUpstreamResponse(data: any) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const baseURL = this.configService.get<string>('OPENAI_BASE_URL');
    const url = `${baseURL}`;
    console.log("url:", url);
    console.log("data:", data);
    const obj = {
      "model": "doubao-seed-2-0-mini-260215",
      "stream": true, // 关键：必须告诉上游返回流式数据
      "input": [
        {
          "role": "user",
          "content": [
            {
              "type": "input_image",
              "image_url": "https://ark-project.tos-cn-beijing.volces.com/doc_image/ark_demo_img_1.png"
            },
            {
              "type": "input_text",
              "text": "你看见了什么？"
            }
          ]
        }
      ]
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
    });
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

    return response;
  }
}
