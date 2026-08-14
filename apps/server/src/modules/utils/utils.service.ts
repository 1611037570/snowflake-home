import { Injectable } from '@nestjs/common'
import pinyin from 'pinyin'

@Injectable()
export class UtilsService {
  /**
   * 将字符串转换为拼音
   * @param text 输入的字符串
   * @returns 转换后的拼音字符串
   */
  convertToPinyin(text: string): string {
    if (!text) return ''

    const result = pinyin(text, {
      // 不带声调
      style: 'normal',
    })

    // pinyin 返回的是二维数组，例如 [['zhong'], ['xin']]，我们需要展平并连接
    return result.flat().join('')
  }
}
