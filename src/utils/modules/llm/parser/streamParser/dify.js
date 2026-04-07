/**
 * Dify 供应商解析逻辑
 * @param {Object} params
 * @param {string} params.line - 原始行字符串
 * @param {Function} params.onProgress - 进度回调
 * @param {boolean} params.debug - 调试模式
 * @returns {string} 解析出的内容
 */
export const difyParser = (line, { onEvent, debug }) => {
  line = line.trim()
  if (!line) return ''
  try {
    const cleanJsonStr = line.replace(/^data:/i, '').trim()
    if (!cleanJsonStr || !cleanJsonStr.startsWith('{') || !cleanJsonStr.endsWith('}')) {
      return ''
    }
    const jsonObj = JSON.parse(cleanJsonStr)
    const { event, data } = jsonObj

    if (event === 'text_chunk') {
      onEvent?.('content', data.text)
      return data.text
    }
    return ''
  } catch (error) {
    if (debug) {
      console.error(`Dify 解析失败，行内容: ${line}`, error)
    }
    throw error
  }
}
