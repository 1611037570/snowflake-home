import { cloneDeep, isEqual } from "lodash-es";
import { getResumeThemeUiPreset } from "@/domain/resume/theme/styles";
import type { ResumeUi, ResumeUiOverrides } from "@/domain/resume/theme/uiTypes";

// 仅展开主题预设中声明的可编辑字段，主题固定外观不进入简历配置。
const mergeUi = (
  preset: Record<string, any>,
  overrides: Record<string, any>,
): Record<string, any> =>
  Object.fromEntries(
    Object.entries(preset).map(([key, value]) => {
      const override = overrides?.[key];
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return [key, mergeUi(value, override)];
      }
      // 数组及叶子值直接复制，避免与缓存预设或导入对象共享引用。
      return [key, cloneDeep(override === undefined ? value : override)];
    }),
  );

// 编辑与预览使用完整配置，默认值统一来自当前主题。
export const resolveResumeUi = (ui?: ResumeUiOverrides): ResumeUi => {
  const preset = getResumeThemeUiPreset(ui?.theme?.template);
  const resolved = mergeUi(preset, ui || {});
  resolved.theme.template = preset.theme.template;
  return resolved as ResumeUi;
};

// 相同于主题预设的参数不重复保存，数组作为完整排序状态比较。
const compactUi = (ui: Record<string, any>, preset: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  Object.entries(preset).forEach(([key, value]) => {
    const current = ui?.[key];
    if (current === undefined || isEqual(current, value)) return;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const children = compactUi(current, value);
      if (Object.keys(children).length) result[key] = children;
    } else {
      result[key] = current;
    }
  });
  return result;
};

// 持久化只保留主题编号及与主题默认值不同的用户覆盖项。
export const compactResumeUi = (ui?: ResumeUiOverrides): ResumeUiOverrides => {
  const preset = getResumeThemeUiPreset(ui?.theme?.template);
  const compact = compactUi(ui || {}, preset);
  compact.theme = {
    ...compact.theme,
    template: preset.theme.template, // 当前主题编号
  };
  return cloneDeep(compact);
};

// 新建、存储与备份共用同一份简历配置压缩规则。
export const compactResumeItem = <T extends { ui?: ResumeUiOverrides /* 用户可编辑参数 */ }>(item: T) =>
  item
    ? {
        ...item,
        ui: compactResumeUi(item.ui), // 主题编号与用户覆盖项
      }
    : item;
