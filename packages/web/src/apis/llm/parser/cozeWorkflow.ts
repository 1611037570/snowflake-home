import { processJson } from '../stream-utils'
export const cozeWorkflowStreamParser = (line: string, { onEvent, debug }: any) => {
  const jsonObj = processJson(line, debug)
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
}
