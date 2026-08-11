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
