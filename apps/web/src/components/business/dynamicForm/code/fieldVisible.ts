import type { FieldCheckRule, FormField } from "../types";
import { resolveDataPath, type DataPath, type DataPathContext } from "./pathContext";

/** 按完整数据路径逐级取值 */
const getValueByPath = (data: any, path: DataPath): any => {
  let current = data;
  for (const key of path) {
    if (current == null) return undefined;
    current = current[key];
  }
  return current;
};

/** 判断路径数据是否满足规则：配置 equals 时按等值比较，未配置时按真值判断 */
const isRuleSatisfied = (value: any, rule: FieldCheckRule): boolean => {
  return rule.hasOwnProperty("equals") ? value === rule.equals : !!value;
};

/**
 * 按表单控制协议解析字段是否置灰
 * - 无 checks.muted 声明：不置灰（默认）
 * - checks.muted 指向的数据满足规则时置灰
 */
export const isFieldMuted = (
  data: Record<string, any> | undefined,
  field: FormField,
  context?: DataPathContext,
): boolean => {
  const rule = field.checks?.muted;
  if (!rule?.path?.length) return false;
  return isRuleSatisfied(getValueByPath(data, resolveDataPath(rule.path, context)), rule);
};

// 按 DSL removed 协议判断字段是否需要从当前表单移除
export const isFieldRemoved = (
  data: Record<string, any> | undefined,
  field: FormField,
  context?: DataPathContext,
): boolean => {
  const rule = field.checks?.removed;
  if (!rule?.path?.length) return false;
  return isRuleSatisfied(getValueByPath(data, resolveDataPath(rule.path, context)), rule);
};
