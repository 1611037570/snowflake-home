import type { FormField } from "../types";
import { getPrimaryModelBinding } from "./schemaAccess";
import { resolveDefaultValue } from "./schemaData";

type DataContainer = Record<string, any>;

const isDataContainer = (value: unknown): value is DataContainer =>
  value !== null && typeof value === "object";

// 将字段绑定中的数组索引通配符解析为当前记录索引
function resolveFieldDataPath(field: FormField, index?: number): string[] | undefined {
  const source = getPrimaryModelBinding(field)?.source;
  if (!source?.length) return;
  if (source.includes("?") && index == null) return;
  return source.map((key) => (key === "?" ? String(index) : key));
}

// 使用字段主数据路径作为稳定标识，不额外维护字段标识
export function getFieldDataKey(field: FormField): string | undefined {
  const source = getPrimaryModelBinding(field)?.source;
  return source?.length ? source.join(".") : undefined;
}

// 按属性是否存在判断字段是否已添加，空值仍视为已添加
export function hasFieldData(rootData: unknown, field: FormField, index?: number): boolean {
  const path = resolveFieldDataPath(field, index);
  if (!path || !isDataContainer(rootData)) return false;

  let current: unknown = rootData;
  for (const key of path) {
    if (!isDataContainer(current) || !Object.prototype.hasOwnProperty.call(current, key)) {
      return false;
    }
    current = current[key];
  }
  return true;
}

// 按字段主数据路径创建默认值，已存在字段保持原值
export function addFieldData(rootData: unknown, field: FormField, index?: number): boolean {
  const binding = getPrimaryModelBinding(field);
  const path = resolveFieldDataPath(field, index);
  if (!binding || !path || !isDataContainer(rootData) || hasFieldData(rootData, field, index)) {
    return false;
  }

  let current: DataContainer = rootData;
  for (let pathIndex = 0; pathIndex < path.length - 1; pathIndex++) {
    const key = path[pathIndex];
    if (key === undefined) return false;
    const existing = current[key];
    if (existing !== undefined && !isDataContainer(existing)) return false;
    if (existing === undefined) {
      current[key] = binding.source[pathIndex + 1] === "?" ? [] : {};
    }
    current = current[key];
  }

  const lastKey = path[path.length - 1];
  if (!lastKey) return false;
  current[lastKey] = resolveDefaultValue(binding.defaultValue);
  return true;
}
