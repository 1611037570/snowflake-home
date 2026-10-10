/** 公共内容块顺序，编号只由实际存在的块产生。 */
export const createContentBlocks = (keys: readonly string[]) => {
  if (new Set(keys).size !== keys.length) throw new Error("内容块名称重复");
  return {
    indexOf: (key: string) => keys.indexOf(key), // 内容块当前序号，不存在时为负一
  };
};

/** 显式块编号允许隐藏字段留下空号，但必须保持严格递增。 */
export const validateContentBlockIndices = (indices: readonly number[]): boolean =>
  indices.every((index, position) => Number.isSafeInteger(index) && index >= 0 &&
    (position === 0 || index > indices[position - 1]!));

export interface ContentBlockRange {
  start: number; // 起始块编号
  end: number; // 不包含的结束块编号
}

/** 裁剪范围统一使用左闭右开区间，不存在的块不得显示。 */
export const isContentBlockVisible = (index: number, range?: ContentBlockRange): boolean =>
  index >= 0 && index >= (range?.start ?? 0) && index < (range?.end ?? Number.MAX_SAFE_INTEGER);
