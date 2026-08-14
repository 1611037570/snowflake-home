import XyRequest from "../request";
const request = new XyRequest({
  baseURL: "https://www.mxnzp.com",
  interceptors: {
    request: (config) => {
      const target = config.method?.toLowerCase() === "get" ? "params" : "data";
      config[target] = {
        ...config[target],
        app_id: "kgghnnptopjnqcpt",
        app_secret: "SRs0hxUth5Ow6R4h16A1pqNOZ0fsZD21",
      };
      return config;
    },
  },
  status: {
    success: 1,
  },
});
export const getIP = async () => {
  return request.get({
    url: "/api/ip/self",
  });
};
export const getWeather = async (city: string) => {
  return request.get({
    url: `/api/weather/current/${city}`,
  });
};
