import type { PageLayoutConfig } from "../pageLayoutTypes";

/**
 * 解析每栏的实际像素宽度。
 * 比例栏按剩余空间分配（与渲染层 flex 分配口径一致），固定栏直接取配置值。
 */
export const resolveColumnWidths = (
  layout: PageLayoutConfig,
  contentWidth: number,
): Map<string, number> => {
  const widths = new Map<string, number>();

  layout.regions.forEach((region) => {
    const columns = region.columns;
    const totalGap = Math.max(0, layout.columnGap) * Math.max(0, columns.length - 1);
    const available = Math.max(0, contentWidth - totalGap);
    const ratioSum = columns.reduce(
      (sum, column) => sum + (column.width.mode === "ratio" ? Math.max(0, column.width.value) : 0),
      0,
    );
    const fixedSum = columns.reduce(
      (sum, column) => sum + (column.width.mode === "fixed" ? Math.max(0, column.width.value) : 0),
      0,
    );
    const ratioSpace = Math.max(0, available - fixedSum);

    columns.forEach((column) => {
      if (column.width.mode === "fixed") {
        widths.set(column.id, Math.max(0, column.width.value));
        return;
      }
      if (ratioSum > 0) {
        widths.set(column.id, (ratioSpace * Math.max(0, column.width.value)) / ratioSum);
        return;
      }
      widths.set(column.id, ratioSpace / Math.max(1, columns.length));
    });
  });

  return widths;
};
