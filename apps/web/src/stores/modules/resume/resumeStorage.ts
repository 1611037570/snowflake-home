import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";
import { del } from "idb-keyval";
import { debounce } from "lodash-es";
import { watch } from "vue";

import { compactResumeItem, resolveResumeUi } from "@/views/resume/theme/resumeUi";

export const createResumeStorage = () => {
  const storageMap = new Map<string, any>();
  // 读取失败保留目录记录，不能把临时存储错误当作简历不存在
  const readErrors = new Map<string, unknown>();
  const pendingItems = new Map<string, any>();
  const storageKey = (id: string) => `snowflake-resume:${id}`;
  const persistResumeItem = (item: any) => {
    if (!item?.id) return;
    const storage = storageMap.get(item.id);
    if (storage) void storage.set(storage.data.value);
  };
  const flushPendingPersist = debounce(() => {
    pendingItems.forEach((item) => persistResumeItem(item));
    pendingItems.clear();
  }, 200);
  const schedulePersistResume = (item: any) => {
    if (!item?.id) return;
    pendingItems.set(item.id, item);
    flushPendingPersist();
  };
  const getResumeStorage = (id: string, initialValue: any = null, writeDefaults = false) => {
    const existing = storageMap.get(id);
    if (existing && !readErrors.has(id)) return existing;
    // 临时读取失败后允许重新加载，不永久缓存失败结果
    readErrors.delete(id);
    // 关闭内置深监听自动写入，改由统一的内容变更监听防抖写入，避免每次按键都触发整份简历的存储写入
    const storage = useIDBKeyval(storageKey(id), initialValue, {
      writeDefaults,
      deep: false,
      // 记录首次读取错误，加载完成后向调用方报告
      onError: (error: unknown) => {
        if (!storageMap.get(id)?.isFinished.value) readErrors.set(id, error);
        console.error("简历存储失败：", error);
      },
      // 嵌套字段可能包含响应式代理，落库前转为可结构化克隆的纯数据
      serializer: {
        // 读取主题编号与覆盖项，完整参数仅在运行时展开
        read: (value: any) => value ? { ...value, ui: resolveResumeUi(value.ui) } : value,
        // 压缩主题配置并解除嵌套代理，避免重复落库和存储失败
        write: (value: any) => JSON.parse(JSON.stringify(compactResumeItem(value))),
      },
    });
    storageMap.set(id, storage);
    return storage;
  };
  const waitForResumeStorage = (storage: any) => {
    if (storage.isFinished.value) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const stop = watch(storage.isFinished, (finished) => {
        if (!finished) return;
        stop();
        resolve();
      });
    });
  };
  const loadResumeItems = async (ids: string[]) => {
    const items = await Promise.all(
      ids.map(async (id) => {
        const storage = getResumeStorage(id);
        await waitForResumeStorage(storage);
        if (readErrors.has(id)) throw readErrors.get(id);
        const item = storage.data.value;
        return item?.id === id ? item : null;
      }),
    );
    return items.filter(Boolean);
  };
  const removeResumeStorage = async (id: string) => {
    pendingItems.delete(id);
    flushPendingPersist.flush();
    const storage = storageMap.get(id);
    await del(storageKey(id));
    if (!storage) return;
    storageMap.delete(id);
    readErrors.delete(id);
  };

  return { getResumeStorage, loadResumeItems, removeResumeStorage, schedulePersistResume };
};
