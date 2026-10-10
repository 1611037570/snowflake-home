import { toRaw } from "vue";
import type { FormField, ModelBinding } from "../types";
import { getModelBindings, walkFormFields } from "./schemaAccess";
import { createDataPathContext, resolveDataPath, type DataPathContext } from "./pathContext";
import { hasFieldData } from "./fieldData";
import { isFieldRemoved } from "./fieldVisible";

// 挂载前一次性补齐现有字段，保留可选字段与已有记录的边界，不改变运行期代理行为。
export function initializeFormData(data: Record<string, any>, fields: FormField[], context?: DataPathContext) {
  const initializeBinding = (binding: ModelBinding, currentContext?: DataPathContext) => {
    if (binding.raw) return;
    const path = resolveDataPath(binding.source, currentContext);
    if (!path.length) return;
    let current = data;
    for (let index = 0; index < path.length - 1; index++) {
      const key = path[index]!;
      if (current[key] == null) current[key] = typeof path[index + 1] === "number" ? [] : {};
      if (typeof current[key] !== "object") return;
      current = current[key];
    }
    const key = path[path.length - 1]!;
    if (!Object.prototype.hasOwnProperty.call(current, key)) {
      current[key] = resolveDefaultValue(binding.defaultValue);
    }
  };
  fields.forEach((field) => {
    const currentContext = field.type === "group" && field.context?.length
      ? createDataPathContext(field.context, context) : context;
    if (isFieldRemoved(data, field, currentContext) || (field.addable && !hasFieldData(data, field, currentContext))) return;
    getModelBindings(field).forEach((binding) => initializeBinding(binding, currentContext));
    if (field.ui?.hidden) initializeBinding(field.ui.hidden, currentContext);
    if (field.ui?.icon) initializeBinding(field.ui.icon, currentContext);
    if (field.type === "array") {
      const path = resolveDataPath(field.source ?? [], currentContext);
      const records = path.reduce<any>((value, key) => value?.[key], data);
      if (Array.isArray(records) && field.itemSchema) {
        records.forEach((_, index) => initializeFormData(data, [field.itemSchema!], { basePath: path, index }));
      }
      return;
    }
    if (field.fields) initializeFormData(data, field.fields, currentContext);
  });
}

// 统一解析字段默认值，并为引用类型创建独立副本
export function resolveDefaultValue(defaultValue: unknown): unknown {
  const value = typeof defaultValue === "function" ? defaultValue() : defaultValue;
  if (value == null) return "";
  // Vue 响应式引用需先解包，否则 structuredClone 无法克隆 Proxy
  return typeof value === "object" ? structuredClone(toRaw(value)) : value;
}

// 按相对路径写入记录，明确默认值可以覆盖此前的兜底值
function setRecordValue(
  record: Record<string, any>,
  path: string[],
  value: unknown,
  overwrite: boolean,
) {
  let current = record;
  for (let index = 0; index < path.length - 1; index++) {
    const key = path[index];
    if (!key) return;
    current = current[key] ?? (current[key] = {});
  }
  const key = path[path.length - 1];
  if (!key) return;
  if (overwrite || !Object.prototype.hasOwnProperty.call(current, key)) {
    current[key] = value;
  }
}

// 根据数组子项结构生成一条完整数据，跳过外部字典绑定
export function createArrayItemData(arrayField: FormField): Record<string, any> {
  const record: Record<string, any> = {};
  if (arrayField.type !== "array" || !arrayField.itemSchema) return record;

  walkFormFields(arrayField.itemSchema, (field) => {
    getModelBindings(field).forEach((binding) => {
      if (binding.raw) return;
      const relativePath = binding.source;
      if (!relativePath.length) return;
      const hasDefault = Object.prototype.hasOwnProperty.call(binding, "defaultValue");
      setRecordValue(record, relativePath, resolveDefaultValue(binding.defaultValue), hasDefault);
    });
  });

  return record;
}
