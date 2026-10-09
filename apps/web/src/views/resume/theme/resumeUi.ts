import { isEqual } from "lodash-es";
import { getResumeThemeTemplate } from "./styles";

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
      return [key, override === undefined ? value : override];
    }),
  );

// 编辑与预览使用完整配置，默认值统一来自当前主题。
export const resolveResumeUi = (ui?: Record<string, any>): Record<string, any> => {
  const preset = getResumeThemeTemplate(ui?.theme?.template).item.ui;
  const resolved = mergeUi(preset, ui || {});
  resolved.theme.template = preset.theme.template;
  return JSON.parse(JSON.stringify(resolved));
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
export const compactResumeUi = (ui?: Record<string, any>): Record<string, any> => {
  const preset = getResumeThemeTemplate(ui?.theme?.template).item.ui;
  const compact = compactUi(ui || {}, preset);
  compact.theme = {
    ...compact.theme,
    template: preset.theme.template, // 当前主题编号
  };
  return JSON.parse(JSON.stringify(compact));
};

// 新建、存储与备份共用同一份简历配置压缩规则。
export const compactResumeItem = (item: any) =>
  item
    ? {
        ...item,
        ui: compactResumeUi(item.ui), // 主题编号与用户覆盖项
      }
    : item;
