import { streamRequest } from './request/streamRequest'

import { handleRetry, processError, processOption } from './stream-utils'

/**
 * LLM 类用于管理与大语言模型的流式和非流式请求。
 * 支持多种 AI 供应商，提供重试机制和错误处理功能。
 */
class LLM {
  /** @type {string} 接口基础地址，用于构建完整请求 URL */
  baseUrl
  /** @type {string} 完整的请求地址，由 baseUrl 和 path 组合而成 */
  url
  /** @type {string} AI 供应商标识，如 'cool' 等 */
  provider
  /** @type {Function|undefined} 获取身份验证 Token 的回调函数，用于请求认证 */
  getToken
  /** @type {boolean} 实例是否已成功初始化（url 是否存在），用于判断实例是否可用 */
  initialized = false
  /**
   * 初始化 LLM 实例
   * @param {Object} config - 配置对象
   * @param {string} [config.baseUrl=""] - 接口基础地址，用于构建完整请求 URL
   * @param {string} [config.path=""] - 接口请求路径，与 baseUrl 组合形成完整 URL
   * @param {string} [config.provider="cool"] - AI 供应商标识，如 'cool' 等
   * @param {Function} [config.getToken] - 获取身份验证 Token 的回调函数，用于请求认证
   */
  constructor(config: {
    baseUrl?: string
    path?: string
    provider?: string
    getToken?: () => string | undefined
  }) {
    const { baseUrl = '', path = '', provider = 'cool', getToken } = config

    this.url = `${baseUrl}${path}`
    this.baseUrl = baseUrl
    this.initialized = !!this.url
    this.provider = provider
    this.getToken = getToken
  }
  /**
   * 获取完整的请求地址
   * @param {string} [path=""] - 接口请求路径，若为空则使用构造时的 path
   * @returns {string} 完整的请求地址，由 baseUrl 和 path 组合而成
   */
  getUrl(path = '') {
    return path ? `${this.baseUrl}${path}` : this.url
  }
  /**
   * 创建并执行 AI 请求任务
   * @param {Object} config - 请求配置对象
   * @param {Object} [config.options={}] - 接口请求参数，包含请求所需的各种参数
   * @param {Function} [config.onSuccess] - 请求成功回调函数，接收解析后的结果
   * @param {Function} [config.onFail] - 请求失败回调函数，接收错误对象
   * @param {Function} [config.onEvent] - 通用事件回调函数，接收事件类型和数据
   * @param {Function} [config.onFinally] - 请求结束回调函数（无论成功或失败）
   * @param {boolean} [config.debug=true] - 是否开启调试模式，开启后会打印请求日志
   * @param {boolean} [config.isJson=true] - 接口返回数据是否为 JSON 格式
   * @param {string} [config.method="POST"] - 请求方法，默认为 POST
   * @param {boolean} [config.isThrow=true] - 发生错误时是否抛出异常
   * @param {number} [config.retryCount=0] - 请求失败时的重试次数
   * @param {boolean} [config.stream=true] - 是否开启流式响应
   * @param {boolean} [config.showToast=true] - 请求失败时是否自动显示 Toast 提示
   * @param {string} [config.path=""] - 接口请求路径，若为空则使用构造时的 path
   * @returns {Promise<any>} 返回请求结果的 Promise，包含 abortFn 和 sendFn
   */
  async request(config: any) {
    const {
      options = {},
      onSuccess,
      onFail,
      onEvent,
      onFinally,
      debug = true,
      isJson = true,
      method = 'POST',
      retryCount = 0,
      stream = true,
      path = '',
      // 请求超时时间，默认 60 秒
      timeout = 60000,
    } = config
    const token = this.getToken?.() || ''
    if (debug) {
      console.log('请求配置 :>> ', config)
    }

    let abortFn
    // 处理请求参数
    const sendFn = async (currentRetryCount = 0) => {
      let isRetrying = false
      try {
        let streamConfig: any = {
          url: this.getUrl(path),
          method,
          debug,
          provider: this.provider,
          timeout,
        }
        let requestHandler

        if (stream) {
          const data = processOption({ options })
          streamConfig = {
            ...streamConfig,
            data,
            isJson,
            onEvent,
          }
          const { send, abort } = streamRequest(token)
          requestHandler = send
          abortFn = abort
        } else {
          console.log('非流式请求')
          return
        }
        const res = await requestHandler?.(streamConfig)
        onSuccess?.(res)
        return res
      } catch (e) {
        const error = processError(e)
        const code = error?.code

        // 处理重试逻辑
        const { retried, result } = await handleRetry({
          code,
          currentRetryCount,
          retryCount,
          debug,
          onRetry: sendFn,
        })

        if (retried) {
          isRetrying = true
          return result
        }
        onFail?.(error)
        // 统一错误处理
        if (debug) {
          console.error('请求失败 :>> ', error)
        }
        throw e
      } finally {
        if (!isRetrying) {
          onFinally?.()
        }
      }
    }
    // return await sendFn();
    return {
      abortFn,
      sendFn,
    }
  }
}

export { LLM }
