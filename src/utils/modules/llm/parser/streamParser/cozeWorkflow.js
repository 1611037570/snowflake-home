export const cozeWorkflowStreamParser = (line, { onEvent, debug }) => {
  line = line.trim()
  if (!line) return ''
  try {
    const cleanJsonStr = line.replace(/^data:/i, '').trim()
    if (!cleanJsonStr || !cleanJsonStr.startsWith('{') || !cleanJsonStr.endsWith('}')) {
      return ''
    }
    const jsonObj = JSON.parse(cleanJsonStr)
    if (debug) console.log('CozeWorkflow JSON', jsonObj)

    const { content_type = '', content = '' } = jsonObj
    if (content_type !== 'text') {
      return ''
    }

    onEvent?.('content', content)
    if (debug) {
      console.log('当前内容 :>> ', content)
    }
    return content
  } catch (error) {
    if (debug) {
      console.error(`CozeWorkflow 解析失败，行内容: ${line}`, error)
    }
    throw error
  }
}
