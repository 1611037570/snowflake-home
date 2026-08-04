import { useCacheStore } from '@/stores'

const baseService = async (options: {
  key: string
  request: () => void
  refresh: boolean
  time?: any
}) => {
  const { key, request, refresh, time = undefined } = options
  const cacheStore = useCacheStore()
  // 如果不强制刷新，尝试从缓存获取数据
  const cachedData = cacheStore.getItem(key)
  if (!refresh && cachedData) {
    return cachedData
  }
  try {
    const data = await request()
    console.log('data', data)
    cacheStore.setItem(key, data, time)
    return data
  } catch (error) {
    console.error('调用回调函数时出错:', error)
  }
}
export default baseService
