import type { FormField } from "../types";
import { resolveDataPath, type DataPath, type DataPathContext } from "./pathContext";
import { getPrimaryModelBinding } from "./schemaAccess";
import { resolveDefaultValue } from "./schemaData";

type DataContainer = Record<string, any>;

const isDataContainer = (value: unknown): value is DataContainer =>
  value !== null && typeof value === "object";

// 字段包裹组：唯一子字段为输入字段、且名称由包裹组声明的分组，自身不承载数据
export function unwrapField(field: FormField | undefined): FormField | undefined {
  if (field?.type !== "group" || field.fields?.length !== 1) return field;
  if (!field.props?.label) return field;
  return field.fields[0]?.type === "object" ? field.fields[0] : field;
}

// 按当前记录上下文解析字段的完整数据路径：字段包裹组按被包裹字段解析
export function getFieldDataPath(
  field: FormField,
  context?: DataPathContext,
): DataPath | undefined {
  const source = getPrimaryModelBinding(unwrapField(field))?.source;
  if (!source?.length) return;
  return resolveDataPath(source, context);
}

// 使用字段主数据路径作为稳定标识，不额外维护字段标识
export function getFieldDataKey(field: FormField, context?: DataPathContext): string | undefined {
  const path = getFieldDataPath(field, context);
  return path?.length ? path.join(".") : undefined;
}

// 按属性是否存在判断字段是否已添加，空值仍视为已添加
export function hasFieldData(
  rootData: unknown,
  field: FormField,
  context?: DataPathContext,
): boolean {
  const path = getFieldDataPath(field, context);
  if (!path || !isDataContainer(rootData)) return false;

  let current: unknown = rootData;
  for (const key of path) {
    // Reflect.has 让 Vue 跟踪缺失属性的存在性变化，hasOwnProperty 保持自有属性语义
    if (
      !isDataContainer(current) ||
      !Reflect.has(current, key) ||
      !Object.prototype.hasOwnProperty.call(current, key)
    ) {
      return false;
    }
    current = current[key];
  }
  return true;
}

// 按字段主数据路径创建默认值，已存在字段保持原值
export function addFieldData(
  rootData: unknown,
  field: FormField,
  context?: DataPathContext,
): boolean {
  const binding = getPrimaryModelBinding(unwrapField(field));
  const path = getFieldDataPath(field, context);
  if (!binding || !path || !isDataContainer(rootData) || hasFieldData(rootData, field, context)) {
    return false;
  }

  let current: DataContainer = rootData;
  for (let pathIndex = 0; pathIndex < path.length - 1; pathIndex++) {
    const key = path[pathIndex];
    if (key === undefined) return false;
    const existing = current[key];
    if (existing !== undefined && !isDataContainer(existing)) return false;
    if (existing === undefined) {
      current[key] = typeof path[pathIndex + 1] === "number" ? [] : {};
    }
    current = current[key];
  }

  const lastKey = path[path.length - 1];
  if (!lastKey) return false;
  current[lastKey] = resolveDefaultValue(binding.defaultValue);
  return true;
}

// 删除字段主数据，删除后字段会回到可添加列表
export function removeFieldData(
  rootData: unknown,
  field: FormField,
  context?: DataPathContext,
): boolean {
  const path = getFieldDataPath(field, context);
  if (!path || !isDataContainer(rootData)) return false;

  let current: DataContainer = rootData;
  for (let pathIndex = 0; pathIndex < path.length - 1; pathIndex++) {
    const key = path[pathIndex];
    if (key === undefined) return false;
    const value = current[key];
    if (!isDataContainer(value)) return false;
    current = value;
  }

  const lastKey = path[path.length - 1];
  if (!lastKey || !Object.prototype.hasOwnProperty.call(current, lastKey)) return false;
  delete current[lastKey];
  return true;
}
