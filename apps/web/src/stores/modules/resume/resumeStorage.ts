import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";
import { del, set } from "idb-keyval";
import { debounce } from "lodash-es";
import { ref, watch } from "vue";

import { compactResumeItem, resolveResumeUi } from "@/domain/resume/theme/resumeUi";

/** 保存状态由实际事务结果驱动，不把防抖排队视为已保存。 */
interface ResumeStorageItem {
  id: string; // 简历唯一编号
  ui?: import("@/domain/resume/theme/uiTypes").ResumeUiOverrides; // 用户配置与主题编号
  [field: string]: unknown; // 其他业务字段原样保存，不由存储层解释
}

export interface ResumeSaveState {
  status: "pending" | "saving" | "saved" | "error"; // 当前保存阶段
  error: string; // 最近一次写入失败说明，成功后清空
}

export const createResumeStorage = () => {
  const storageMap = new Map<string, ReturnType<typeof useIDBKeyval<ResumeStorageItem | null>>>();
  // 读取失败保留目录记录，不能把临时存储错误当作简历不存在
  const readErrors = new Map<string, unknown>();
  const pendingItems = new Map<string, ResumeStorageItem>();
  const storageKey = (id: string) => `snowflake-resume:${id}`;
  const saveStates = ref<Record<string, ResumeSaveState>>({}); // 按简历编号记录保存结果
  const writeTasks = new Map<string, Promise<void>>(); // 同一简历的写入按调用顺序完成
  const deletingIds = new Set<string>(); // 删除期间阻止同一简历重新排队写入
  const revisions = new Map<string, number>(); // 防止旧事务覆盖新版本保存状态
  const persistResumeItem = (item: ResumeStorageItem): Promise<void> => {
    const id = item.id;
    const revision = revisions.get(id);
    const previous = writeTasks.get(id) ?? Promise.resolve();
    const task = previous.catch(() => {}).then(async () => {
      if (deletingIds.has(id)) return; // 删除接管后不执行尚未开始的旧写入
      if (revisions.get(id) === revision) saveStates.value[id] = { status: "saving", error: "" };
      try {
        const storage = storageMap.get(id);
        if (storage && !storage.isFinished.value) await waitForResumeStorage(storage);
        // 直接等待数据库事务；读取工具会吞掉写入异常，不能用于确认保存成功。
        const snapshot = JSON.parse(JSON.stringify(compactResumeItem(item)));
        await set(storageKey(id), snapshot);
        if (revisions.get(id) === revision) saveStates.value[id] = { status: "saved", error: "" };
      } catch (error) {
        if (revisions.get(id) === revision) {
          saveStates.value[id] = { status: "error", error: error instanceof Error ? error.message : String(error) };
          pendingItems.set(id, item); // 留待显式重试，不自动无限重试
        }
        throw error;
      }
    });
    writeTasks.set(id, task);
    void task.finally(() => { if (writeTasks.get(id) === task) writeTasks.delete(id); }).catch(() => {});
    return task;
  };
  // 排队与正在执行的事务一起等待，失败向调用方报告。
  const flushPersistResume = async (): Promise<void> => {
    flushPendingPersist.cancel();
    const items = [...pendingItems.values()];
    pendingItems.clear();
    const tasks = [...writeTasks.values(), ...items.map(persistResumeItem)];
    const results = await Promise.allSettled(tasks);
    const failure = results.find((result) => result.status === "rejected");
    if (failure?.status === "rejected") throw failure.reason;
  };
  const reportPersistError = (error: unknown) => console.error("简历存储失败：", error);
  const flushPendingPersist = debounce(() => { void flushPersistResume().catch(reportPersistError); }, 200);
  const schedulePersistResume = (item: ResumeStorageItem | undefined) => {
    if (!item?.id || deletingIds.has(item.id)) return;
    revisions.set(item.id, (revisions.get(item.id) ?? 0) + 1);
    saveStates.value[item.id] = { status: "pending", error: "" };
    pendingItems.set(item.id, item);
    flushPendingPersist();
  };
  const getResumeStorage = (id: string, initialValue: ResumeStorageItem | null = null, writeDefaults = false) => {
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
        read: (value: unknown) => {
          if (value == null) return null;
          // 数据库读入先确认简历身份，再进入已约束的配置解析入口。
          if (typeof value !== "object" || typeof (value as ResumeStorageItem).id !== "string") {
            throw new Error("简历存储数据格式无效");
          }
          const item = value as ResumeStorageItem;
          return { ...item, ui: resolveResumeUi(item.ui) };
        },
        // 压缩主题配置并解除嵌套代理，避免重复落库和存储失败
        write: (value: ResumeStorageItem | null) => value ? JSON.parse(JSON.stringify(compactResumeItem(value))) : value,
      },
    });
    storageMap.set(id, storage);
    return storage;
  };
  const waitForResumeStorage = (storage: ReturnType<typeof useIDBKeyval<ResumeStorageItem | null>>) => {
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
    deletingIds.add(id);
    try {
      pendingItems.delete(id);
      // 等待已开始的事务后删除；等待期间的新请求也不能恢复正文。
      await writeTasks.get(id)?.catch(() => {});
      pendingItems.delete(id);
      await del(storageKey(id));
      delete saveStates.value[id];
      revisions.delete(id);
      storageMap.delete(id);
      readErrors.delete(id);
    } finally { deletingIds.delete(id); }
  };

  return { getResumeStorage, loadResumeItems, removeResumeStorage, schedulePersistResume, flushPersistResume, saveStates };
};
