import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { ref } from 'vue'

// 定义缓存项类型：包含值和过期时间戳
interface CacheItem {
  value: any
  expireTime?: number // 过期时间戳（毫秒），undefined 表示永不过期
}

export const useCacheStore = defineStore(
  'cache',
  () => {
    // 存储所有缓存项
    const cacheMap = ref<Record<string, CacheItem>>({})

    /**
     * 设置缓存
     * @param key 缓存键名
     * @param value 缓存值
     * @param timeout 过期时间（支持：number 毫秒数 / 'today' 当天过期 / undefined 永不过期）
     */
    const setItem = (key: string, value: any, timeout?: number | 'today') => {
      const item: CacheItem = { value }

      if (timeout === 'today') {
        // 当天 23:59:59.999 过期
        item.expireTime = dayjs().endOf('day').valueOf()
      } else if (typeof timeout === 'number') {
        // 当前时间 + 自定义毫秒数过期
        item.expireTime = dayjs().add(timeout, 'millisecond').valueOf()
      }

      // 更新缓存映射（响应式更新）
      cacheMap.value[key] = item
    }

    /**
     * 获取缓存（自动检查是否过期）
     * @param key 缓存键名
     */
    const getItem = (key: string) => {
      const item = cacheMap.value[key]
      if (!item) return null

      // 过期则删除并返回默认值
      if (item.expireTime && dayjs().valueOf() > item.expireTime) {
        delete cacheMap.value[key]
        return null
      }

      // 未过期则返回值
      return item.value
    }

    /**
     * 删除指定缓存
     * @param key 缓存键名
     */
    const removeItem = (key: string) => {
      delete cacheMap.value[key]
    }

    /**
     * 清空所有缓存
     */
    const clearAll = () => {
      cacheMap.value = {}
    }

    return {
      cacheMap,
      setItem,
      getItem,
      removeItem,
      clearAll,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['cacheMap'],
    },
  },
)
