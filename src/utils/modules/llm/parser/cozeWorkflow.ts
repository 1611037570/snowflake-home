import { processJson } from '../stream-utils'
export const cozeWorkflowStreamParser = (line: string, { onEvent, debug }: any) => {
  const jsonObj = processJson(line, debug)
  try {
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
