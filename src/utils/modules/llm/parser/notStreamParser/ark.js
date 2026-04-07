import { StreamError, ERROR_CODES } from '../../stream-utils'

/**
 * Ark 供应商非流式解析逻辑
 * @param {Object} res - 原始响应对象
 * @returns {any} 解析出的数据
 */
export const arkParser = (res) => {
  if (!res) {
    throw new StreamError('请求失败，返回数据为空', ERROR_CODES.NETWORK_ERROR)
  }
  return res
}
