import { findResumeModuleSchema } from "@snowflake/resume-agent";
import type { EvalChange, EvalResumeView } from "./types";

// 单个值的展示长度上限，避免整段正文把对比面板撑爆
const VALUE_LIMIT = 240;

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const stringify = (value: unknown) => {
  if (value === undefined) return "";
  if (value === null) return "null";
  if (typeof value === "string") {
    return value.length > VALUE_LIMIT ? `${value.slice(0, VALUE_LIMIT)}…` : value;
  }
  try {
    const text = JSON.stringify(value);
    return text.length > VALUE_LIMIT ? `${text.slice(0, VALUE_LIMIT)}…` : text;
  } catch {
    return String(value);
  }
};

// 用序列化结果比较，避免对象引用不同但内容相同时被误判为改动
const isSame = (left: unknown, right: unknown) => {
  try {
    return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
  } catch {
    return left === right;
  }
};

// 逐字段收集差异，字段名优先使用表单里配置的中文标签
const collectFields = (
  prefix: string,
  previous: Record<string, unknown>,
  next: Record<string, unknown>,
  labels: Map<string, string>,
  output: EvalChange[],
) => {
  const keys = new Set([...Object.keys(previous), ...Object.keys(next)]);
  keys.forEach((field) => {
    const before = previous[field];
    const after = next[field];
    if (isSame(before, after)) return;
    output.push({
      path: `${prefix}.${labels.get(field) ?? field}`,
      before: stringify(before),
      after: stringify(after),
    });
  });
};

// 对比评测快照与写入后的简历，产出人可以逐条核对的改动清单
export const diffResume = (
  before: EvalResumeView,
  after: EvalResumeView,
  limit = 60,
): EvalChange[] => {
  const changes: EvalChange[] = [];
  const moduleKeys = [...new Set([...Object.keys(before), ...Object.keys(after)])];

  for (const moduleKey of moduleKeys) {
    const previous = before[moduleKey];
    const next = after[moduleKey];
    const title = next?.title || previous?.title || moduleKey;

    if (!previous) {
      changes.push({ path: title, before: "（无此模块）", after: "新增模块" });
      continue;
    }
    if (!next) {
      changes.push({ path: title, before: "存在", after: "（模块已删除）" });
      continue;
    }
    if (previous.title !== next.title) {
      changes.push({
        path: `${title}（模块标题）`,
        before: previous.title ?? "",
        after: next.title ?? "",
      });
    }

    const schema = findResumeModuleSchema(moduleKey, next.data);
    const labels = new Map((schema?.fields ?? []).map((field) => [field.key, field.label]));
    const previousData = previous.data;
    const nextData = next.data;

    // 数组模块按记录下标比较，长度变化单独列出
    if (Array.isArray(previousData) && Array.isArray(nextData)) {
      if (previousData.length !== nextData.length) {
        changes.push({
          path: `${title}（记录数）`,
          before: `${previousData.length}`,
          after: `${nextData.length}`,
        });
      }
      const count = Math.max(previousData.length, nextData.length);
      for (let index = 0; index < count; index += 1) {
        const beforeRecord = asRecord(previousData[index]);
        const afterRecord = asRecord(nextData[index]);
        if (!beforeRecord && afterRecord) {
          changes.push({ path: `${title}[${index}]`, before: "（无此记录）", after: "新增记录" });
          continue;
        }
        if (beforeRecord && !afterRecord) {
          changes.push({ path: `${title}[${index}]`, before: "存在", after: "（记录已删除）" });
          continue;
        }
        if (beforeRecord && afterRecord) {
          collectFields(`${title}[${index}]`, beforeRecord, afterRecord, labels, changes);
        }
      }
    } else {
      const beforeRecord = asRecord(previousData);
      const afterRecord = asRecord(nextData);
      if (beforeRecord && afterRecord) {
        collectFields(title, beforeRecord, afterRecord, labels, changes);
      } else if (!isSame(previousData, nextData)) {
        changes.push({ path: title, before: stringify(previousData), after: stringify(nextData) });
      }
    }

    if (changes.length >= limit) break;
  }

  return changes.slice(0, limit);
};
