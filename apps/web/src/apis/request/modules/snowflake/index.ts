import { config } from "@/configs";
import XyRequest from "../../request";
import axios from "axios";
const request = new XyRequest({
  baseURL: config.api.baseUrl,
});

// 雪花服务Ping
export const snowflakePing = async () => {
  const response = await request.get({
    url: "/",
  });

  // 请求拦截器会返回错误对象，这里统一转为拒绝以便准确记录连接状态。
  if (response instanceof Error || response?.isAxiosError) throw response;

  return response;
};

export interface CreateFeedbackParams {
  content: string;
  contact?: string;
  pageUrl?: string;
}

export const createFeedback = async (data: CreateFeedbackParams) => {
  const response = await request.post({
    url: "/feedback",
    data,
  });

  // Convert intercepted Axios errors back into rejected requests.
  if (response instanceof Error || response?.isAxiosError) throw response;

  return response;
};

export const getIP = async () => {
  // 访问者地址由服务端从连接层读取，不再依赖第三方按来源返回
  return request.get({
    url: "/integrations/ip",
  });
};

export const getWeather = async (city: string) => {
  return request.get({
    url: "/integrations/weather",
    params: { city },
  });
};

export const getHotList = async (category: string) => {
  return request.get({
    url: "/integrations/hot-list",
    params: { category },
  });
};

export const getBaiduSearch = async (msg: string) => {
  return request.get({
    url: "/integrations/search",
    params: { q: msg },
  });
};

export const createResumePdf = async (item: any, system?: any, signal?: AbortSignal) => {
  // 将打印取消信号传递给服务端导出请求
  const response = await axios.post<Blob>(
    `${config.api.baseUrl}/resume/pdf`,
    { item, system },
    {
      responseType: "blob",
      signal,
      timeout: 120000,
      headers: { "Content-Type": "application/json;charset=UTF-8" },
    },
  );
  return response.data;
};
