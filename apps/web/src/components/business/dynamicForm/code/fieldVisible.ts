import type { FieldCheckRule, FieldChecks, FormField } from "../types";
import {
  createDataPathContext,
  resolveDataPath,
  type DataPath,
  type DataPathContext,
} from "./pathContext";

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

// 根分组使用自身上下文解析模块级控制路径
const getFieldContext = (field: FormField, context?: DataPathContext) => {
  if (context || field.type !== "group" || !field.context?.length) return context;
  return createDataPathContext(field.context);
};

/**
 * 按表单控制协议解析字段是否隐藏
 * - 无 checks.hidden 声明：不置灰（默认）
 * - checks.hidden 指向的数据满足规则时置灰
 */
export const isFieldHidden = (
  data: Record<string, any> | undefined,
  field: FormField,
  context?: DataPathContext,
): boolean => {
  const rule = field.checks?.hidden;
  if (!rule?.path?.length) return false;
  return isRuleSatisfied(
    getValueByPath(data, resolveDataPath(rule.path, getFieldContext(field, context))),
    rule,
  );
};

// 按 DSL removed 协议判断字段是否需要从当前表单移除
export const isFieldRemoved = (
  data: Record<string, any> | undefined,
  field: FormField,
  context?: DataPathContext,
): boolean => {
  const rule = field.checks?.removed;
  if (!rule?.path?.length) return false;
  return isRuleSatisfied(
    getValueByPath(data, resolveDataPath(rule.path, getFieldContext(field, context))),
    rule,
  );
};

/**
 * 按表单控制协议写入字段检查值
 * 与 isFieldHidden/isFieldRemoved 对称：只写字段自身 checks 声明的路径，业务无需关心数据结构
 */
export const setFieldCheckValue = (
  data: Record<string, any> | undefined,
  field: FormField,
  checkKey: keyof FieldChecks,
  value: boolean,
  context?: DataPathContext,
): void => {
  const rule = field.checks?.[checkKey];
  if (!rule?.path?.length) return;
  const path = resolveDataPath(rule.path, getFieldContext(field, context));
  const lastKey = path[path.length - 1];
  if (lastKey === undefined) return;
  let current = data;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (key === undefined) return;
    current = current?.[key];
  }
  if (current) current[lastKey] = value;
};
