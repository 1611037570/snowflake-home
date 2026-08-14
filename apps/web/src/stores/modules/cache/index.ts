import dayjs from "dayjs";
import { defineStore } from "pinia";
import { ref } from "vue"; // 补充导入computed
import { calculateDataSize, calculateEvictionScore } from "./utils";

/**
 * 缓存项接口定义
 * @property value 缓存值
 * @property expired 过期时间戳（毫秒），undefined 表示永不过期
 * @property count 使用次数
 * @property lastTime 最近一次使用时间戳（毫秒）
 * @property size 格式化后的缓存体积（如 12.34 KB）
 * @property bytes 缓存体积原始字节数（新增：用于累加总大小）
 */
interface CacheItem {
  value: any;
  expired?: number | undefined; // 过期时间戳（毫秒），undefined 表示永不过期
  count: number; // 总访问次数
  lastTime: number; // 最近一次使用时间戳（毫秒）
  size: string; // 格式化后的缓存体积
  bytes: number; // 原始字节数
}

export const useCacheStore = defineStore(
  "cache",
  () => {
    // 存储所有缓存项（键值对形式）
    const cacheMap = ref<Record<string, CacheItem>>({});
    // 最大缓存数量限制
    const maxCacheSize = 100;

    /**
     * 设置缓存项
     * @param key 缓存键名
     * @param value 缓存值
     * @param expired 过期时间（支持：number 毫秒数 / 'today' 当天过期 / undefined 永不过期）
     */
    const setItem = (key: string, value: any, expired?: number | "today") => {
      if (!key || key.trim() === "") {
        console.error("缓存键名不能为空");
        return;
      }
      try {
        // 尝试序列化，确保可以被持久化
        JSON.stringify(value);
      } catch (error) {
        console.error(`缓存值无法序列化，已跳过 ${key}:`, error);
        return;
      }
      const { bytes, size } = calculateDataSize(value);
      const data = cacheMap.value[key] || {};

      // 计算缓存值的体积（字节数+格式化字符串）
      const default_data = {
        count: 0, // 初始总访问次数为0
        expired: undefined, // 默认永不过期
      };
      const item: CacheItem = {
        ...default_data,
        ...data,
        lastTime: dayjs().valueOf(), // 初始最后使用时间为当前时间
        size,
        bytes,
        value,
      };

      // 处理过期时间
      if (expired === "today") {
        // 当天 23:59:59.999 过期
        item.expired = dayjs().endOf("day").valueOf();
      } else if (typeof expired === "number") {
        // 当前时间 + 自定义毫秒数过期
        item.expired = dayjs().add(expired, "millisecond").valueOf();
      }

      // 存入缓存
      cacheMap.value[key] = item;

      // 如果缓存数量超过最大限制，执行淘汰策略
      if (Object.keys(cacheMap.value).length > maxCacheSize) {
        deleteMostWorthyItem();
      }
    };

    /**
     * 获取缓存项（自动检查过期，更新使用次数和最后使用时间）
     * @param key 缓存键名
     * @returns 缓存值（过期/不存在返回null）
     */
    const getItem = (key: string) => {
      const item = cacheMap.value[key];
      if (!item) return null;
      const now = dayjs().valueOf();
      // 检查是否过期：过期则删除并返回null
      if (item.expired && now > item.expired) {
        delete cacheMap.value[key];
        return null;
      }

      item.lastTime = now; // 更新最近一次使用时间为当前时间
      item.count++; // 命中次数+1
      return item.value;
    };

    /**
     * 删除指定缓存项
     * @param key 缓存键名
     */
    const removeItem = (key: string) => {
      delete cacheMap.value[key];
    };

    const deleteMostWorthyItem = (): string | null => {
      const now = dayjs().valueOf();
      let minScore = Infinity; // 初始化最小评分（无穷大）
      let keyToDelete: string | null = null;
      clearExpiredItems(); // 清理过期项
      for (const [key, item] of Object.entries(cacheMap.value)) {
        // 计算当前缓存项的评分
        const score = calculateEvictionScore(item, now);
        // 找到评分最低的项（最该被淘汰）
        if (score < minScore) {
          minScore = score;
          keyToDelete = key;
        }
      }

      // 执行删除并返回被删除的键名
      if (keyToDelete) {
        delete cacheMap.value[keyToDelete];
        return keyToDelete;
      }

      // 无任何可删除的缓存项
      return null;
    };

    /**
     * 清空所有缓存项
     */
    const clearAll = () => {
      cacheMap.value = {};
    };

    /**
     * 清理所有过期的缓存项
     * @returns 被清理的过期项数量
     */
    function clearExpiredItems() {
      const now = dayjs().valueOf();
      let clearedCount = 0;
      for (const [key, item] of Object.entries(cacheMap.value)) {
        if (item.expired && now > item.expired) {
          delete cacheMap.value[key];
          clearedCount++;
        }
      }
      return clearedCount;
    }

    return {
      cacheMap, // 缓存映射表
      clearExpiredItems, // 清理过期项
      setItem, // 设置缓存
      getItem, // 获取缓存
      removeItem, // 删除指定缓存
      clearAll, // 清空所有缓存
    };
  },
  {
    persist: {
      storage: localStorage,
      pick: ["cacheMap"],
    },
  },
);
