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
 * 按 DSL checks 协议解析字段是否隐藏
 * - 无 checks.hidden 声明：不隐藏（默认）
 * - checks.hidden 指向的数据满足规则时隐藏
 */
export const isFieldHidden = (data: Record<string, any> | undefined, field: FormField): boolean => {
  const rule = field.checks?.hidden;
  if (!rule?.path?.length) return false;
  return isRuleSatisfied(getValueByPath(data, rule.path), rule);
};
