/**
 * Roll相关服务层
 * 封装业务逻辑，调用API层，处理数据转换和缓存
 */
import { getIP, getWeather } from "@/apis";
import baseService from "@/services/baseService";

/**
 * 获取IP信息，带缓存策略
 * @returns IP信息数据
 */
export async function getIPData(refresh: boolean = false) {
  const request = async () => {
    return await getIP();
  };
  const data = baseService({
    key: "ip",
    request,
    refresh,
  });
  return data;
}

/**
 * 获取天气信息，带缓存策略
 * @param city 城市名称
 * @returns 天气信息数据
 */
export async function getWeatherData(city: string, refresh: boolean = false) {
  const request = async () => {
    // 归属地改由服务端按访问者 IP 提供，天气需要调用方显式给出城市。
    const name = (city || "").trim();
    if (!name) {
      return null;
    }
    return await getWeather(name);
  };
  const data = baseService({
    key: `weather`,
    request,
    refresh,
  });
  return data;
}
