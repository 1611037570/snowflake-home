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
}

/** 按原始顺序去重，便于错误提示保持稳定 */
const unique = (keys: string[]): string[] => [...new Set(keys)];

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

  return {
    valid:
      missingModuleKeys.length === 0 &&
      duplicateModuleKeys.length === 0 &&
      unknownModuleKeys.length === 0,
    missingModuleKeys,
    duplicateModuleKeys,
    unknownModuleKeys,
  };
};
