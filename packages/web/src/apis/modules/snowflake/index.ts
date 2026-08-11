import XyRequest from "../../request";
const request = new XyRequest({
  baseURL: import.meta.env.VITE_SNOWFLAKE_API_URL,
});
export const test = async () => {
  return request.get({
    url: "/",
  });
};
// 雪花服务问候
export const getSnowflakeMessage = async () => {
  return request.get({
    url: "/",
  });
};
