import { findResumeModuleSchema } from "@snowflake/resume-core";
import { isResumeMediaField } from "@snowflake/resume-core/mediaFields";
import type { ResumeOperationObserver } from "@/stores/modules/resume/resumeOperations";
import type { ResumeChange, ResumeChangeCallbacks, ResumeFieldChange } from "./types";
import { toChangeText } from "./textDiff";

interface ChangeSource {
  readData: () => Record<string, any> | undefined; // 读取当前简历的真实业务数据
  getModuleTitle: (key: string) => string; // 读取模块展示名称
  getLayout: (key: string) => string | undefined; // 读取当前模块的数据形态
}

// 在本地保存独立快照，避免后续写入改变修改前的内容。
const clone = (value: unknown): any => value == null ? value : JSON.parse(JSON.stringify(value));

export const createResumeChangeObserver = (
  source: ChangeSource,
  callbacks: ResumeChangeCallbacks,
): ResumeOperationObserver => (operation) => {
  try {
    const key = operation.module;
    const readModule = () => source.readData()?.[key];
    const module = readModule();
    const schemaData = operation.op === "updateModule" ? module?.data : module?.list;
    const schema = findResumeModuleSchema(key, schemaData, source.getLayout(key));
    const title = source.getModuleTitle(key);
    const recordName = (record: any, index: number) => {
      const data = record?.data;
      return [data?.name, data?.title, data?.position].find((value) => typeof value === "string" && value.trim()) || `第 ${index + 1} 条记录`;
    };
    // 媒体不复制到详情，防止图片编码撑大会话内存。
    const copyRecord = (data: any) => clone(Object.fromEntries(
      Object.entries(data ?? {}).filter(([field]) => !isResumeMediaField(key, field)),
    ));
    const index = "index" in operation ? operation.index : operation.op === "moveRecord" ? operation.from : undefined;
    const record = index == null ? undefined : module?.list?.[index];
    const location = record ? `${title} · ${recordName(record, index!)}` : title;
    const field = "field" in operation ? operation.field : "";
    const readField = () => {
      const current = readModule();
      const data = operation.op === "updateModule" ? current?.data : current?.list?.[index!]?.data;
      const value = data?.[field];
      return isResumeMediaField(key, field) ? value ? "[图片内容]" : "" : clone(value);
    };
    const beforeValue = operation.op === "updateModuleTitle" ? clone(module?.ui?.title || title)
      : field ? readField()
        : operation.op === "deleteRecord" ? copyRecord(record?.data) : undefined;
    // 排序期间沿用原始名称，未命名记录也不会因下标变化而改名。
    const orderNames = new Map<object, string>();
    const beforeOrder = operation.op === "moveRecord" ? (module?.list ?? []).map((item: any, position: number) => {
      const name = recordName(item, position);
      orderNames.set(item, name);
      return name;
    }) : undefined;
    const makeField = (name: string, before: unknown, after: unknown): ResumeFieldChange => {
      const definition = schema?.fields.find((item) => item.key === name);
      const oldText = toChangeText(before, definition?.format === "html");
      const newText = toChangeText(after, definition?.format === "html");
      return {
        label: definition?.label || name, // 沿用字段契约中的展示名称
        before: oldText, // 操作前文本
        after: newText, // 操作后文本
        formatOnly: oldText === newText && JSON.stringify(before) !== JSON.stringify(after), // 区分纯格式变化
      };
    };
    // 回调在该条操作写入成功后立即读取实际结果，避免同批操作改变下标。
    return (addedIndex) => {
      try {
        const current = readModule();
        let change: ResumeChange;
        if (operation.op === "moveRecord") {
          change = {
            type: "move", // 排序操作
            location, // 移动时的记录名称
            fields: [], // 排序不修改字段
            beforeOrder, // 移动前顺序
            afterOrder: (current?.list ?? []).map((item: any, position: number) => orderNames.get(item) ?? recordName(item, position)), // 移动后沿用原始记录名称
            from: operation.from, // 原位置
            to: operation.to, // 新位置
          };
        } else if (operation.op === "addRecord" || operation.op === "deleteRecord") {
          const added = operation.op === "addRecord";
          const data = added ? copyRecord(current?.list?.[addedIndex!]?.data) : beforeValue;
          const fields = Object.entries(data ?? {}).map(([name, value]) => makeField(name, added ? undefined : value, added ? value : undefined))
            .filter((item) => item.before.trim() || item.after.trim());
          change = {
            type: added ? "add" : "delete", // 新增或删除整条记录
            location: added ? `${title} · ${recordName(current?.list?.[addedIndex!], addedIndex!)}` : location, // 实际记录名称
            fields, // 实际写入或删除的字段
          };
        } else {
          const afterValue = operation.op === "updateModuleTitle" ? current?.ui?.title
            : readField();
          const detail = makeField(field, beforeValue, clone(afterValue));
          if (operation.op === "updateModuleTitle") detail.label = "模块标题";
          change = {
            type: "update", // 修改单个字段
            location: `${location} · ${detail.label}`, // 模块、记录及字段位置
            fields: [detail], // 对应字段的前后内容
          };
        }
        callbacks.onChange(change);
      } catch { callbacks.onError(); }
    };
  } catch {
    // 只在该操作确实成功后提示详情不可用。
    return () => callbacks.onError();
  }
};
