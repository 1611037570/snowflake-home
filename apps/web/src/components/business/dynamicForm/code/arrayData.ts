import type { FormField } from "../types";
import { getArrayDataPath } from "./schemaAccess";
import { createArrayItemData } from "./schemaData";

// 按数组字段声明读取真实记录，不在读取时创建缺失数据
export function getArrayRecords(rootData: unknown, arrayField: FormField): any[] | undefined {
  const path = getArrayDataPath(arrayField);
  if (!path) return;
  let current: any = rootData;
  for (const key of path) {
    if (current == null || typeof current !== "object") return;
    current = current[key];
  }
  return Array.isArray(current) ? current : undefined;
}

// 按数组字段声明创建缺失路径，仅供新增记录时使用
function ensureArrayRecords(rootData: unknown, arrayField: FormField): any[] | undefined {
  const path = getArrayDataPath(arrayField);
  if (!path || rootData == null || typeof rootData !== "object") return;
  if (!path.length) return Array.isArray(rootData) ? rootData : undefined;

  let current: any = rootData;
  for (let index = 0; index < path.length; index++) {
    const key = path[index];
    if (!key) return;
    const isLast = index === path.length - 1;
    if (isLast) {
      if (current[key] == null) current[key] = [];
      return Array.isArray(current[key]) ? current[key] : undefined;
    }
    if (current[key] == null) current[key] = {};
    if (typeof current[key] !== "object" || Array.isArray(current[key])) return;
    current = current[key];
  }
}

// 根据 itemSchema 创建默认数据并追加到真实记录数组
export function addArrayRecord(rootData: unknown, arrayField: FormField): number {
  const records = ensureArrayRecords(rootData, arrayField);
  if (!records) return -1;
  records.push(createArrayItemData(arrayField));
  return records.length - 1;
}

// 从真实记录数组删除指定下标
export function removeArrayRecord(
  rootData: unknown,
  arrayField: FormField,
  index: number,
): boolean {
  const records = getArrayRecords(rootData, arrayField);
  if (!records || !Number.isInteger(index) || index < 0 || index >= records.length) return false;
  records.splice(index, 1);
  return true;
}

// 在真实记录数组内移动指定记录
export function moveArrayRecord(
  rootData: unknown,
  arrayField: FormField,
  from: number,
  to: number,
): boolean {
  const records = getArrayRecords(rootData, arrayField);
  if (
    !records ||
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= records.length ||
    to >= records.length
  ) {
    return false;
  }
  const [record] = records.splice(from, 1);
  records.splice(to, 0, record);
  return true;
}
