import { StreamError, ERROR_CODES, processToken } from '../stream-utils'
import { getParser } from '../parser/index'

// 处理非流式请求
export function notStreamRequest(token) {
  let requestTask
  const abort = () => {
    if (!requestTask) {
      return
    }
    requestTask?.abort()
  }
  const send = async ({ method, data, debug, url, provider }) => {
    await abort()
    return new Promise((resolve, reject) => {
      try {
        requestTask = uni.request({
          url,
          method,
          data,
          header: {
            'Content-Type': 'application/json',
            Authorization: processToken(token),
          },
          success: (res) => {
            if (res.statusCode !== 200) {
              throw new StreamError(
                `请求失败，状态码: ${res.statusCode}`,
                ERROR_CODES.NETWORK_ERROR,
              )
            }
            const parser = getParser({ provider, isStream: false })
            const result = parser(res.data)
            resolve(result)
          },
          fail: (err) => {
            reject(err)
          },
          complete: () => {
            abort()
          },
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  return { send, abort }
}
