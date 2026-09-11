import { toRaw } from "vue";
import type { FormField } from "../types";
import { getModelBindings, walkFormFields } from "./schemaAccess";

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
      const markerIndex = binding.source.indexOf("?");
      if (markerIndex === -1) return;
      const relativePath = binding.source.slice(markerIndex + 1);
      if (!relativePath.length || relativePath.includes("?")) return;
      const hasDefault = Object.prototype.hasOwnProperty.call(binding, "defaultValue");
      setRecordValue(
        record,
        relativePath,
        resolveDefaultValue(binding.defaultValue),
        hasDefault,
      );
    });
  });

  return record;
}
