/**
 * 排序纯函数：引擎内拖拽与外部排序入口共用同一套规则，
 * 避免各处重复实现导致排序行为不一致
 */

import type { FormField } from "../types";

// 按可见顺序回填完整列表：未参与排序的项保留在原槽位
export function applyVisibleOrder<T>(
  list: T[],
  orderedVisible: T[],
  isVisible: (item: T) => boolean,
): void {
  const visibleIndexes = list.reduce((indexes: number[], item, index) => {
    if (isVisible(item)) indexes.push(index);
    return indexes;
  }, []);
  visibleIndexes.forEach((listIndex, visibleIndex) => {
    if (orderedVisible[visibleIndex]) list[listIndex] = orderedVisible[visibleIndex];
  });
}

// 固定项保底校正：固定项按原相对顺序始终排在最前
export function keepFixedFirst<T>(list: T[], isFixed: (item: T) => boolean): void {
  const fixed = list.filter(isFixed);
  if (!fixed.length) return;
  const others = list.filter((item) => !isFixed(item));
  const next = [...fixed, ...others];
  if (next.some((item, index) => item !== list[index])) {
    list.splice(0, list.length, ...next);
  }
}

/** 移动目标位置：落到目标字段之前或之后 */
export type FieldPosition = "before" | "after";

// 按 key 定位并把字段移到目标字段前/后：key 为稳定标识，不随增删导致的索引平移失效
export function moveFieldByKey(
  fields: FormField[],
  fromKey: string,
  toKey: string,
  position: FieldPosition = "before",
): boolean {
  if (!fromKey || !toKey || fromKey === toKey) return false;
  const fromIndex = fields.findIndex((field) => field.key === fromKey);
  const toIndex = fields.findIndex((field) => field.key === toKey);
  if (fromIndex < 0 || toIndex < 0) return false;
  // 固定字段不参与移动，也不允许插到固定字段之前
  if (fields[fromIndex].fixed) return false;
  if (fields[toIndex].fixed && position === "before") return false;

  const [field] = fields.splice(fromIndex, 1);
  // 移除后按 key 重新定位目标，避免来源下标影响目标下标
  const target = fields.findIndex((item) => item.key === toKey);
  fields.splice(position === "after" ? target + 1 : target, 0, field);
  keepFixedFirst(fields, (item) => item.fixed);
  return true;
}
