/**
 * 排序纯函数：引擎内拖拽与外部排序入口共用同一套规则，
 * 避免各处重复实现导致排序行为不一致
 */

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
