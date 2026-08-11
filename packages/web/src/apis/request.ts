import type { AxiosRequestConfig } from "axios";
import axios from "axios";
// 自定义拦截器类型
export interface XyRequestInterceptors {
  request?: (config: AxiosRequestConfig) => any; // 请求成功拦截
  requestCatch?: (error: any) => any; // 请求失败拦截
  response?: (response: any) => any; // 响应成功拦截
  responseCatch?: (error: any) => any; // 响应失败拦截
}

export interface XyStatus {
  success: number | number[]; // 可以支持多个成功码
  unauthorized?: number | number[]; // 未授权码，如401
  forbidden?: number | number[]; // 禁止访问码，如403
  notFound?: number | number[]; // 资源不存在，如404
  serverError?: number | number[]; // 服务器错误，如500
}

// 扩展默认类型
export interface XyRequestConfig extends AxiosRequestConfig {
  interceptors?: XyRequestInterceptors;
  status?: XyStatus;
  debug?: boolean;
}
const default_config: XyRequestConfig = {
  // 超时时间
  timeout: 10000,
  headers: {
    // 内容类型
    "Content-type": "application/json;charset=UTF-8",
  },
};
// 默认状态码配置
const defaultStatus: XyStatus = {
  success: 200,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  serverError: 500,
};

// 默认调试模式
const defaultDebug = true;
/**
 * 自定义Axios请求类
 */
class XyRequest {
  // 实例
  instance: any;
  // 拦截器
  interceptors;
  // 状态码
  status: XyStatus;
  // 调试模式
  debug?: boolean;

  // 构造函数
  constructor(config: XyRequestConfig) {
    // 检查状态码是否为对象
    let status: any = config?.status;
    if (status && typeof status !== "object") {
      console.warn("status 参数必须为对象");
      status = {};
    }
    // 初始化状态码
    this.status = { ...defaultStatus, ...status };

    if (config && typeof config !== "object") {
      console.warn("config 参数必须为对象");
      config = {};
    }
    // 初始化实例
    this.instance = axios.create({ ...default_config, ...config });
    // 初始化拦截器
    this.interceptors = config?.interceptors || {};

    // 初始化调试模式
    this.debug = typeof config?.debug === "boolean" ? config.debug : defaultDebug;
    this.customInterceptors();
    // 注册请求拦截
    this.requestInterceptors();
    // 注册响应拦截
    this.responseInterceptors();
  }
  // 检查是否是成功码
  private isSuccessCode(code: number): boolean {
    // 检查是否是成功码
    const successCodes = this.status.success;
    if (Array.isArray(successCodes)) {
      return successCodes.includes(code);
    }
    return code === successCodes;
  }
  // 用户自定义拦截器
  private customInterceptors() {
    const interceptors = this.interceptors;
    // 注册请求拦截器处理逻辑
    this.instance.interceptors.request.use(interceptors?.request, interceptors?.requestCatch);
    // 注册响应拦截器处理逻辑
    this.instance.interceptors.response.use(interceptors?.response, interceptors?.responseCatch);
  }
  // 默认请求拦截器
  private requestInterceptors() {
    // 注册请求拦截器处理逻辑
    this.instance.interceptors.request.use(
      // 请求成功拦截
      (config: any) => {
        return config;
      },
      // 请求失败拦截
      (err: any) => {
        if (this.debug) {
          console.error("请求拦截器错误:", err);
        }
        return err;
      },
    );
  }
  // 默认响应拦截器
  private responseInterceptors() {
    // 注册响应拦截器处理逻辑
    this.instance.interceptors.response.use(
      // 响应成功拦截
      (res: any) => {
        if (this.debug) {
          console.log("res:>> ", res);
        }
        const { status } = res;
        // 判断HTTP状态码
        if (status !== 200) {
          return res;
        }
        // 非对象类型
        if (typeof res.data !== "object") {
          // 直接返回给调用者自行处理
          return res.data;
        }
        const { code, data } = res.data;
        // 业务状态码
        if (this.isSuccessCode(code)) {
          return data;
        }

        return res.data;
      },
      // 响应失败拦截
      (err: any) => {
        if (this.debug) {
          console.error("响应拦截器错误:", err);
        }
        return err;
      },
    );
  }

  // 网络请求
  request<T = any>(config: XyRequestConfig): Promise<T> {
    return this.instance.request(config);
  }

  get<T = any>(config: XyRequestConfig): Promise<T> {
    return this.request({ ...config, method: "GET" });
  }

  post<T = any>(config: XyRequestConfig): Promise<T> {
    return this.request({ ...config, method: "POST" });
  }

  delete<T = any>(config: XyRequestConfig): Promise<T> {
    return this.request({ ...config, method: "DELETE" });
  }

  patch<T = any>(config: XyRequestConfig): Promise<T> {
    return this.request({ ...config, method: "PATCH" });
  }
}

export default XyRequest;
