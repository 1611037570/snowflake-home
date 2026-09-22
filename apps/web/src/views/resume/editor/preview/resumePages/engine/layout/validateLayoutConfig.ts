import type { PageLayoutConfig } from "../pageLayoutTypes";

/** 页面布局配置校验结果 */
export interface LayoutConfigValidation {
  /** 配置是否有效 */
  valid: boolean;
  /** 实际模块中没有被任何栏指定的模块 key */
  missingModuleKeys: string[];
  /** 被多个栏重复指定的模块 key */
  duplicateModuleKeys: string[];
  /** 布局配置中存在但实际模块不存在的模块 key */
  unknownModuleKeys: string[];
  /** 重复的区域编号 */
  duplicateRegionIds: string[];
  /** 重复的栏编号 */
  duplicateColumnIds: string[];
  /** 页面尺寸、间距或宽度等数值配置错误的位置 */
  invalidLayoutFields: string[];
}

/** 按原始顺序去重，便于错误提示保持稳定 */
const unique = (keys: string[]): string[] => [...new Set(keys)];
const isNonNegativeNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;
const isPositiveNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

/**
 * 校验页面布局配置中的模块分配关系。
 * 未指定模块只报告错误，不自动放入任何区域或栏位。
 */
export const validateLayoutConfig = (
  layout: PageLayoutConfig,
  moduleKeys: string[],
): LayoutConfigValidation => {
  const actualModuleKeys = unique(moduleKeys);
  const configuredModuleKeys = layout.regions.flatMap((region) =>
    region.columns.flatMap((column) => column.moduleKeys),
  );
  const configuredModuleKeySet = new Set(configuredModuleKeys);
  const actualModuleKeySet = new Set(actualModuleKeys);

  const missingModuleKeys = actualModuleKeys.filter((key) => !configuredModuleKeySet.has(key));
  const duplicateModuleKeys = unique(
    configuredModuleKeys.filter(
      (key, index) => configuredModuleKeys.indexOf(key) !== index,
    ),
  );
  const unknownModuleKeys = unique(
    configuredModuleKeys.filter((key) => !actualModuleKeySet.has(key)),
  );
  const regionIds = layout.regions.map((region) => region.id);
  const duplicateRegionIds = unique(
    regionIds.filter((id, index) => regionIds.indexOf(id) !== index),
  );
  const columnIds = layout.regions.flatMap((region) => region.columns.map((column) => column.id));
  const duplicateColumnIds = unique(
    columnIds.filter((id, index) => columnIds.indexOf(id) !== index),
  );
  const invalidLayoutFields: string[] = [];

  if (!isPositiveNumber(layout.pageSize.width)) invalidLayoutFields.push("pageSize.width");
  if (!isPositiveNumber(layout.pageSize.height)) invalidLayoutFields.push("pageSize.height");
  if (!isNonNegativeNumber(layout.regionGap)) invalidLayoutFields.push("regionGap");
  if (!isNonNegativeNumber(layout.columnGap)) invalidLayoutFields.push("columnGap");
  (["top", "right", "bottom", "left"] as const).forEach((side) => {
    if (!isNonNegativeNumber(layout.pagePadding[side])) {
      invalidLayoutFields.push(`pagePadding.${side}`);
    }
  });
  layout.regions.forEach((region, regionIndex) => {
    if (!region.id.trim()) invalidLayoutFields.push(`regions[${regionIndex}].id`);
    if (!Number.isFinite(region.order)) invalidLayoutFields.push(`regions[${regionIndex}].order`);
    if (region.height.mode === "fixed" && !isNonNegativeNumber(region.height.value)) {
      invalidLayoutFields.push(`regions[${regionIndex}].height.value`);
    }
    region.columns.forEach((column, columnIndex) => {
      if (!column.id.trim()) {
        invalidLayoutFields.push(`regions[${regionIndex}].columns[${columnIndex}].id`);
      }
      if (!isNonNegativeNumber(column.gap)) {
        invalidLayoutFields.push(`regions[${regionIndex}].columns[${columnIndex}].gap`);
      }
      if (!isPositiveNumber(column.width.value)) {
        invalidLayoutFields.push(`regions[${regionIndex}].columns[${columnIndex}].width.value`);
      }
    });
  });

  return {
    valid:
      missingModuleKeys.length === 0 &&
      duplicateModuleKeys.length === 0 &&
      unknownModuleKeys.length === 0 &&
      duplicateRegionIds.length === 0 &&
      duplicateColumnIds.length === 0 &&
      invalidLayoutFields.length === 0,
    missingModuleKeys,
    duplicateModuleKeys,
    unknownModuleKeys,
    duplicateRegionIds,
    duplicateColumnIds,
    invalidLayoutFields,
  };
};
