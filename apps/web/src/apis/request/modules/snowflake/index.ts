import XyRequest from "../../request";
const request = new XyRequest({
  baseURL: import.meta.env.VITE_SNOWFLAKE_API_URL,
});

// 雪花服务Ping
export const snowflakePing = async () => {
  return request.get({
    url: "/",
  });
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
