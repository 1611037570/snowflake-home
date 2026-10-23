import { get, set } from "idb-keyval";
import type { EvalRun } from "./types";

// 评测结果单独存储，避免与请求观测记录互相覆盖
const RUN_STORAGE_KEY = "resume-eval-runs";
// 最多保留的历史运行次数，超出后丢弃最旧记录
const RUN_LIMIT = 20;
// 单条回答的保存上限，避免历史记录无限膨胀
const ANSWER_LIMIT = 6000;

// 读取历史运行，失败时按空列表处理，不影响页面打开
export const loadRuns = async (): Promise<EvalRun[]> => {
  try {
    const saved = await get<EvalRun[]>(RUN_STORAGE_KEY);
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

// 将本次运行写入历史，超长回答先截断
export const saveRun = async (run: EvalRun) => {
  const saved = await loadRuns();
  const record: EvalRun = {
    ...run,
    results: run.results.map((item) => ({
      ...item,
      answer: item.answer.length > ANSWER_LIMIT ? `${item.answer.slice(0, ANSWER_LIMIT)}…` : item.answer,
    })),
  };
  const next = [record, ...saved].slice(0, RUN_LIMIT);
  try {
    await set(RUN_STORAGE_KEY, next);
  } catch {
    // 持久化失败不影响本次结果展示
  }
  return next;
};

// 清空历史运行
export const clearRuns = async () => {
  try {
    await set(RUN_STORAGE_KEY, []);
  } catch {
    // 清空失败时保留内存态，下次进入页面继续尝试
  }
};
