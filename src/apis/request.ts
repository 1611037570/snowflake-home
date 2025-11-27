import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'
// 自定义拦截器类型
export interface XyRequestInterceptors {
  requestInterceptor?: (config: AxiosRequestConfig) => any // 请求成功拦截
  requestInterceptorCatch?: (error: any) => any // 请求失败拦截
  responseInterceptor?: (response: any) => any // 响应成功拦截
  responseInterceptorCatch?: (error: any) => any // 响应失败拦截
}
// 扩展默认类型
export interface XyRequestConfig extends AxiosRequestConfig {
  interceptors?: XyRequestInterceptors
  fixedData?: Record<string, any> // 新增固定参数配置项
}
const default_config = {
  // 超时时间
  timeout: 10000,
  headers: {
    // 内容类型
    'Content-type': 'application/json;charset=UTF-8',
  },
}
/**
 * 自定义Axios请求类
 */
class XyRequest {
  instance

  interceptors

  constructor(config: XyRequestConfig) {
    this.instance = axios.create({ ...default_config, ...config })
    this.interceptors = config.interceptors
    this.alone()
    this.all()
  }
  // 单例拦截
  alone() {
    // 注册单例请求拦截
    this.instance.interceptors.request.use(
      this.interceptors?.requestInterceptor,
      this.interceptors?.requestInterceptorCatch,
    )
    // 注册单例响应拦截
    this.instance.interceptors.response.use(
      this.interceptors?.responseInterceptor,
      this.interceptors?.responseInterceptorCatch,
    )
  }
  // 全局拦截
  all() {
    // 注册全局请求拦截
    this.instance.interceptors.request.use(
      (config: any) => {
        if (!config.fixedData) {
          return config
        }

        // 根据请求方法决定参数添加位置
        const target = config.method?.toLowerCase() === 'get' ? 'params' : 'data'
        config[target] = {
          ...config[target],
          ...config.fixedData,
        }

        return config
      },
      (err) => err,
    )
    // 注册全局响应拦截
    this.instance.interceptors.response.use(
      (res: any) => {
        console.log('res', res)
        const { code, data } = res.data
        if (code !== 200 && code !== 1) {
          console.error('请求失败', res)
          return
        }

        return data
      },
      (err) => {
        return err
      },
    )
  }

  // 网络请求
  request<T = any>(config: XyRequestConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      // 单独请求拦截
      config = config.interceptors?.requestInterceptor
        ? config.interceptors.requestInterceptor(config)
        : config
      // 确保链式调用是一个完整的表达式
      return this.instance
        .request<T, any>(config)
        .then((res) => {
          // 单独响应拦截
          res = config.interceptors?.responseInterceptor
            ? config.interceptors.responseInterceptor(res)
            : res
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  get<T = any>(config: XyRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'GET' })
  }

  post<T = any>(config: XyRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'POST' })
  }

  delete<T = any>(config: XyRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'DELETE' })
  }

  patch<T = any>(config: XyRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'PATCH' })
  }
}

export default XyRequest
