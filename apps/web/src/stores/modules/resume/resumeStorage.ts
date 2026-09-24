import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";
import { del } from "idb-keyval";
import { debounce } from "lodash-es";
import { watch } from "vue";

type ResumeStorageOptions = {
  defaultUI: Record<string, any>;
};

export const createResumeStorage = ({ defaultUI }: ResumeStorageOptions) => {
  const storageMap = new Map<string, any>();
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
    if (existing) return existing;
    // 关闭内置深监听自动写入，改由统一的内容变更监听防抖写入，避免每次按键都触发整份简历的存储写入
    const storage = useIDBKeyval(storageKey(id), initialValue, {
      writeDefaults,
      deep: false,
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
  const fillResumeUiDefaults = (item: any) => {
    if (!item.ui || typeof item.ui !== "object") item.ui = structuredClone(defaultUI);
    Object.entries(defaultUI).forEach(([key, value]) => {
      if (item.ui[key] === undefined) item.ui[key] = value;
    });
    return item;
  };
  const loadResumeItems = async (ids: string[]) => {
    const items = await Promise.all(
      ids.map(async (id) => {
        const storage = getResumeStorage(id);
        await waitForResumeStorage(storage);
        const item = storage.data.value;
        return item?.id === id ? fillResumeUiDefaults(item) : null;
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
  };

  return { getResumeStorage, loadResumeItems, removeResumeStorage, schedulePersistResume };
};
