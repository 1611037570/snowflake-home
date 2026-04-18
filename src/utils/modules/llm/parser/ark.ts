import { ERROR_CODES, processJson, StreamError } from '../stream-utils'

/**
 * Ark 供应商非流式解析逻辑
 * @param {Object} res - 原始响应对象
 * @returns {any} 解析出的数据
 */
export const arkParser = (res: any) => {
  if (!res) {
    throw new StreamError('请求失败，返回数据为空', ERROR_CODES.NETWORK_ERROR)
  }
  return res
}

export const arkStreamParser = (line: string, { onEvent, debug }: any) => {
  const data = processJson(line, debug)
  const { type, delta } = data

  let currentOutputContent = '' // 最终输出给用户的内容
  let currentReasoningContent = '' // 模型推理过程内容
  let totalTokens = 0 // Token 消耗统计

  // 推理内容增量（response.reasoning_summary_text.delta）
  if (type === 'response.reasoning_summary_text.delta' && delta) {
    currentReasoningContent = delta
    onEvent?.('reasoning', currentReasoningContent)
  }
  // 输出内容增量（response.output_text.delta）
  if (type === 'response.output_text.delta' && delta) {
    currentOutputContent = delta
    onEvent?.('content', currentOutputContent)
  }

  // 处理 Token 消耗 (response.completed)
  if (type === 'response.completed' && data.response?.usage) {
    totalTokens = data.response.usage.total_tokens
    onEvent?.('total_tokens', totalTokens)
  }

  // 6. 调试日志
  if (debug) {
    currentReasoningContent && console.log('🔍 当前推理增量:', currentReasoningContent)
    currentOutputContent && console.log('💬 当前输出增量:', currentOutputContent)
    totalTokens && console.log('📊 Token 消耗:', totalTokens)
  }

  // 7. 返回增量内容和统计
  return {
    content: currentOutputContent,
    reasoning: currentReasoningContent,
    total_tokens: totalTokens,
  }
}
