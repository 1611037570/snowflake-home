import { getBaiduSearch } from '@/apis'
import baseService from '../baseService'
/**
 * 获取百度搜索结果，带缓存策略
 * @param msg 搜索关键词
 * @returns 百度搜索结果数据
 */
export async function getBaiduSearchData(msg: string, refresh: boolean = false) {
  const request = async () => {
    return await getBaiduSearch(msg)
  }
  const data = baseService({
    key: `baidu_search_${msg}`,
    request,
    refresh,
  })
  return data
}
