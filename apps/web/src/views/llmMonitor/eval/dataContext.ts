import {
  executeResumeOperations,
  type ResumeOperationTarget,
} from "@/stores/modules/resume/resumeOperations";
import { findResumeModuleSchema, type ResumeToolContext } from "@snowflake/resume-agent";
import type { EvalResumeView } from "./types";

// 评测沙箱：所有读写只落在快照副本上，不影响用户正在编辑的简历
export type EvalSandbox = {
  // 提供给简历工具的上下文
  ctx: ResumeToolContext;
  // 当前快照副本，断言据此判断写入结果
  getView: () => EvalResumeView;
  // 本轮同步过的展示语言，未同步时为空
  getLanguage: () => string;
};

// 新增记录按字段类型补齐默认值，与真实编辑器初始化记录的口径一致
const createEmptyRecord = (moduleKey: string) => {
  const schema = findResumeModuleSchema(moduleKey, []);
  const record: Record<string, unknown> = {};
  (schema?.fields ?? []).forEach((field) => {
    record[field.key] =
      field.valueType === "array"
        ? []
        : field.valueType === "object"
          ? {}
          : field.valueType === "number"
            ? 0
            : "";
  });
  return record;
};

// 把语义化写操作落到内存快照，六个能力与真实 Store 的实现保持同名同语义
const createMemoryTarget = (view: EvalResumeView): ResumeOperationTarget => {
  const getRecords = (moduleKey: string) => {
    const data = view[moduleKey]?.data;
    return Array.isArray(data) ? (data as Record<string, unknown>[]) : null;
  };
  return {
    updateModuleField: (moduleKey, field, value) => {
      const data = view[moduleKey]?.data;
      if (!data || typeof data !== "object" || Array.isArray(data)) return false;
      (data as Record<string, unknown>)[field] = value;
      return true;
    },
    updateModuleTitle: (moduleKey, title) => {
      const module = view[moduleKey];
      if (!module || !title.trim()) return false;
      module.title = title.trim();
      return true;
    },
    updateRecordField: (moduleKey, index, field, value) => {
      const record = getRecords(moduleKey)?.[index];
      if (!record) return false;
      // 快照可能缺少空的可选字段，字段契约声明过即允许补填
      if (
        !(field in record) &&
        !findResumeModuleSchema(moduleKey, [])?.fields.some((item) => item.key === field)
      ) {
        return false;
      }
      record[field] = value;
      return true;
    },
    // 逐项比较写入前后的值，区分真实改动与同值提交
    readModuleField: (moduleKey, field) => {
      const data = view[moduleKey]?.data;
      if (!data || typeof data !== "object" || Array.isArray(data)) return undefined;
      return (data as Record<string, unknown>)[field];
    },
    readRecordField: (moduleKey, index, field) => getRecords(moduleKey)?.[index]?.[field],
    readModuleTitle: (moduleKey) => view[moduleKey]?.title,
    addDataRecord: (moduleKey) => {
      const records = getRecords(moduleKey);
      if (!records) return -1;
      records.push(createEmptyRecord(moduleKey));
      return records.length - 1;
    },
    removeDataRecord: (moduleKey, index) => {
      const records = getRecords(moduleKey);
      if (!records || index < 0 || index >= records.length) return false;
      records.splice(index, 1);
      return true;
    },
    moveDataRecord: (moduleKey, from, to) => {
      const records = getRecords(moduleKey);
      if (!records) return false;
      const count = records.length;
      if (from < 0 || from >= count || to < 0 || to >= count) return false;
      const [record] = records.splice(from, 1);
      records.splice(to, 0, record!);
      return true;
    },
  };
};

export const createEvalSandbox = (snapshot: EvalResumeView): EvalSandbox => {
  // 深拷贝保证多次运行互不影响，也避免改到用例里声明的快照
  const view: EvalResumeView = JSON.parse(JSON.stringify(snapshot));
  const target = createMemoryTarget(view);
  let language = "";
  return {
    getView: () => view,
    getLanguage: () => language,
    ctx: {
      getResumeData: () => view,
      applyResumeOperations: (operations) => executeResumeOperations(operations, target),
      // 展示语言只记录在沙箱内，不写回界面
      updateLanguage: (value) => {
        language = value;
        return true;
      },
    },
  };
};
