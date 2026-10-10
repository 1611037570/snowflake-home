import { computed, readonly, ref } from "vue";
import { createGlobalState, StorageSerializers, useStorage } from "@vueuse/core";
import { getGithubStars, GITHUB_REPOSITORY } from "../../apis/github";

interface GithubStarsCache {
  stars: number; // 仓库 Star 总数
  updatedAt: number; // 最近一次成功获取数据的时间戳
}

const CACHE_DURATION = 30 * 60 * 1000;
const RETRY_DELAY = 60 * 1000;

// 页头与移动入口共用状态，跨路由挂载也不会重复请求。
export const useGithubStars = createGlobalState(() => {
  const cache = useStorage<GithubStarsCache | null>(
    `snowflake:github-stars:${GITHUB_REPOSITORY}`,
    null,
    undefined,
    {
      serializer: StorageSerializers.object, // 空初值仍按 JSON 读写缓存
      onError: () => {}, // 存储不可用时保留内存状态，避免打断页面
    },
  );
  const loading = ref(false);
  const failed = ref(false);
  const checkedAt = ref(Date.now());
  let retryAfter = 0;
  let pending: Promise<void> | null = null;

  // 本地缓存同样校验，损坏或未来时间的数据不参与展示。
  const validCache = computed(() => {
    const value = cache.value;
    if (
      !value ||
      !Number.isSafeInteger(value.stars) ||
      value.stars < 0 ||
      !Number.isSafeInteger(value.updatedAt) ||
      value.updatedAt <= 0 ||
      value.updatedAt > checkedAt.value
    )
      return null;
    return value;
  });
  const stars = computed(() => validCache.value?.stars ?? null);
  const stale = computed(
    () => !!validCache.value && checkedAt.value - validCache.value.updatedAt >= CACHE_DURATION,
  );

  const refresh = (): Promise<void> => {
    checkedAt.value = Date.now();
    if (pending) return pending;
    if (validCache.value && !stale.value) return Promise.resolve();
    // 失败后短暂退避，避免反复切换页面触发限流。
    if (checkedAt.value < retryAfter) return Promise.resolve();
    loading.value = true;
    failed.value = false;
    pending = (async () => {
      try {
        const count = await getGithubStars();
        const updatedAt = Date.now();
        checkedAt.value = updatedAt;
        cache.value = { stars: count, updatedAt };
        retryAfter = 0;
      } catch {
        // 请求失败保留旧缓存，不把失败结果误报为零。
        failed.value = true;
        retryAfter = Date.now() + RETRY_DELAY;
      } finally {
        checkedAt.value = Date.now();
        loading.value = false;
        pending = null;
      }
    })();
    return pending;
  };

  return {
    stars, // 可展示的 Star 数，未获取时为空
    stale, // 当前展示的是过期缓存
    loading: readonly(loading), // 正在刷新 Star 数
    failed: readonly(failed), // 最近一次请求失败
    refresh, // 检查缓存并按需刷新，共享进行中的请求
  };
});
