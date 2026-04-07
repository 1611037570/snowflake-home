import { getParser } from './parser/index'

// 定义自定义错误类
export class StreamError extends Error {
  constructor(message, code = -1) {
    super(message)
    this.code = code
    this.name = 'StreamError'
  }
}

// 错误码常量
export const ERROR_CODES = {
  NETWORK_ERROR: 0, // 网络/请求级错误
  BUSINESS_ERROR: -1, // 业务逻辑/参数错误
}

export function processOption({ options }) {
  const data = JSON.stringify({
    ...options,
    stream: true, // 强制开启流式响应
  })

  return data
}

// 处理token
export function processToken(token) {
  return `Bearer ${token}`
}

// 创建流式解析器
export function createStreamParser({ onEvent, debug, provider }) {
  let buffer = ''
  console.log('provider', provider)

  // 根据 provider 选择解析函数
  const params = (line) => {
    const options = { onEvent, debug }
    const parser = getParser({ provider, isStream: true })

    if (!parser) {
      const msg = `未找到供应商 ${provider} 的解析器`
      if (debug) console.warn(msg)
      throw new StreamError(msg, ERROR_CODES.BUSINESS_ERROR)
    }

    return parser(line, options)
  }

  return function (chunk) {
    let currentBatchContent = ''
    let currentBatchUsage = null

    // 1. 拼接新数据到缓冲区
    buffer += chunk

    // 2. 统一换行符并分割
    const normalizedBuffer = buffer.replace(/\r\n/g, '\n')
    const lines = normalizedBuffer.split('\n')

    // 3. 关键：保留最后一部分（可能是不完整的行）到下一次处理
    buffer = lines.pop() || ''

    // 4. 处理完整的行
    for (const line of lines) {
      const res = params(line)
      if (typeof res === 'string') {
        currentBatchContent += res
      } else if (res && typeof res === 'object') {
        currentBatchContent += res.content || ''
        if (res.total_tokens) {
          currentBatchUsage = res.total_tokens
        }
      }
    }

    return {
      content: currentBatchContent,
      usage: currentBatchUsage,
    }
  }
}

// 处理最终结果
export function processResult({ text, isJson = true, debug }) {
  let result = ''
  try {
    if (typeof text !== 'string' || !text.length) {
      throw new StreamError('最终结果为空，无法解析', ERROR_CODES.NETWORK_ERROR)
    }
    result = text.trim()
    // 解析最终结果
    result = isJson ? JSON.parse(result) : result
    if (debug) {
      console.log('流式传输完成，最终结果:', result)
    }
    return result
  } catch (err) {
    if (err instanceof StreamError) {
      throw err
    }
    throw new StreamError(
      `最终结果解析失败: ${err.message}，原始内容: ${text}`,
      ERROR_CODES.BUSINESS_ERROR,
    )
  }
}

// 处理错误信息
export function processError(e) {
  let error = e

  if (e instanceof StreamError) {
    return { code: e.code, message: e.message }
  }

  if (typeof e === 'string') {
    try {
      error = JSON.parse(e)
    } catch (err) {
      error = { code: -1, message: e }
    }
  } else if (e instanceof Error) {
    try {
      // 尝试解析 message 里的 JSON (兼容旧代码)
      const parsed = JSON.parse(e.message)
      if (parsed && typeof parsed === 'object' && 'message' in parsed) {
        error = parsed
      } else {
        error = { code: -1, message: e.message }
      }
    } catch (err) {
      error = { code: -1, message: e.message }
    }
  }

  return error
}

/**
 * 处理重试逻辑
 * @param {Object} params
 * @param {number} params.code 错误码
 * @param {number} params.currentRetryCount 当前重试次数
 * @param {number} params.retryCount 最大重试次数
 * @param {boolean} params.debug 是否开启调试模式
 * @param {Function} params.onRetry 重试回调函数
 * @returns {Promise<{retried: boolean, result?: any}>}
 */
export async function handleRetry({ code, currentRetryCount, retryCount, debug, onRetry }) {
  if (code === 0 && currentRetryCount < retryCount) {
    const delay = 1000 * (currentRetryCount + 1)
    if (debug) {
      console.log(
        `请求失败(code=0)，准备在 ${delay}ms 后进行第 ${currentRetryCount + 1}/${retryCount} 次重试...`,
      )
    }
    await new Promise((resolve) => setTimeout(resolve, delay))
    const result = await onRetry(currentRetryCount + 1)
    return { retried: true, result }
  }
  return { retried: false }
}
