import { coolParser } from './streamParser/cool'
import { difyParser } from './streamParser/dify'
import { arkParser } from './notStreamParser/ark'
import { arkStreamParser } from './streamParser/ark'
import { cozeWorkflowStreamParser } from './streamParser/cozeWorkflow'

// 流式解析器管理对象
export const streamParsers = {
  cool: coolParser,
  dify: difyParser,
  ark: arkStreamParser,
  cozeWorkflow: cozeWorkflowStreamParser,
}

// 非流式解析器管理对象
export const notStreamParsers = {
  ark: arkParser,
}

/**
 * 获取解析器的工厂函数
 * @param {Object} params
 * @param {string} params.provider - 供应商名称
 * @param {boolean} [params.isStream=true] - 是否为流式解析
 * @returns {Function} 解析器函数
 */
export const getParser = ({ provider, isStream = true }) => {
  const parserGroup = isStream ? streamParsers : notStreamParsers
  const parser = parserGroup[provider]

  if (!parser) {
    throw new Error(`未找到供应商 ${provider} 的${isStream ? '流式' : '非流式'}解析器`)
  }

  return parser
}
