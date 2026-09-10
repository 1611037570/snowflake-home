import type { FieldCheckRule, FormField } from "../types";

/** 按数据路径逐级取值（沿用 model.source 路径语义；"?" 通配不在显隐判断场景使用） */
const getValueByPath = (data: any, path: string[]): any => {
  let current = data;
  for (const key of path) {
    if (current == null || key === "?") return undefined;
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
export const isFieldMuted = (data: Record<string, any> | undefined, field: FormField): boolean => {
  const rule = field.checks?.muted;
  if (!rule?.path?.length) return false;
  return isRuleSatisfied(getValueByPath(data, rule.path), rule);
};

// 按 DSL visible 协议判断字段是否需要从当前表单移除
export const isFieldVisible = (data: Record<string, any> | undefined, field: FormField): boolean => {
  const rule = field.checks?.visible;
  if (!rule?.path?.length) return false;
  return isRuleSatisfied(getValueByPath(data, rule.path), rule);
};
