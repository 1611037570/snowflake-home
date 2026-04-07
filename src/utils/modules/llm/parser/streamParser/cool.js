import { StreamError, ERROR_CODES } from '../../stream-utils'

const error_list = [
  {
    value: 'account has an overdue balance',
    message: '余额已不足 请先充值',
  },
  {
    value: 'API key format is incorrect',
    message: 'API密钥错误',
  },
]
const error_defult = {
  value: 'default',
  message: '未知错误 请联系管理员',
}
/**
 * Flow 供应商解析逻辑 (原默认逻辑)
 * @param {string} line - 原始行字符串
 * @param {Object} options
 * @param {Function} options.onProgress - 进度回调
 * @param {boolean} options.debug - 调试模式
 * @returns {string} 解析出的内容
 */
export const coolParser = (line, { onEvent, debug }) => {
  line = line.trim()
  if (!line) return ''
  try {
    const cleanJsonStr = line.replace(/^data:/i, '').trim()
    if (!cleanJsonStr || !cleanJsonStr.startsWith('{') || !cleanJsonStr.endsWith('}')) {
      return ''
    }
    const jsonObj = JSON.parse(cleanJsonStr)
    const { msgType, data } = jsonObj

    if (msgType == 'llmStream') {
      const { content } = data
      if (debug) {
        console.log('当前内容', content)
      }
      if (typeof content === 'string' && content.length) {
        onEvent?.('content', content)
        return content
      }
      return ''
    } else if (msgType == 'node') {
      const result = data?.result
      if (result && result?.success == false) {
        let error = error_list.find((item) => {
          return result?.error.includes(item.value)
        })
        error = error || error_defult
        throw new StreamError(error.message, ERROR_CODES.BUSINESS_ERROR)
      }
    }
    return ''
  } catch (error) {
    // 解析失败通常忽略（等待下一帧），但在调试模式下打印
    if (debug) {
      console.error(`Flow 解析失败，行内容: ${line}`, error)
    }
    throw error
  }
}
