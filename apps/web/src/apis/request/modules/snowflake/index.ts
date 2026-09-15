import XyRequest from "../../request";
import axios from "axios";
const request = new XyRequest({
  baseURL: import.meta.env.VITE_SNOWFLAKE_API_URL,
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

export const createResumePdf = async (item: any, system?: any) => {
  const response = await axios.post<Blob>(
    `${import.meta.env.VITE_SNOWFLAKE_API_URL}/resume/pdf`,
    { item, system },
    {
      responseType: "blob",
      timeout: 120000,
      headers: { "Content-Type": "application/json;charset=UTF-8" },
    },
  );
  return response.data;
};
