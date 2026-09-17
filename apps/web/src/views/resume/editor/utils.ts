import { createDataPathContext, resolveDataPath } from "@/components/business/dynamicForm";

// 模块字段路径始终基于分组上下文解析
const getFieldPath = (field: any, path: string[]) =>
  resolveDataPath(
    path,
    field?.context?.length ? createDataPathContext(field.context) : undefined,
  );

/**
 * 设置模块隐藏状态：按字段显隐路径将对应数据置值（true 隐藏 / false 恢复）
 * @param data 简历数据
 * @param field 字段配置（含 checks.hidden.path）
 * @param value 目标隐藏状态
 */
export const setFieldHidden = (data: any, field: any, value: boolean) => {
  const source = field.checks?.hidden?.path;
  if (!source?.length) return;
  const path = getFieldPath(field, source);
  let cur = data;
  for (let i = 0; i < path.length - 1; i++) {
    cur = cur?.[path[i]];
  }
  if (cur) cur[path[path.length - 1]] = value;
};

/**
 * 设置模块归档状态：按字段归档路径将对应数据置值
 * @param data 简历数据
 * @param field 字段配置（含 checks.removed.path）
 * @param value 目标归档状态
 */
export const setFieldArchived = (data: any, field: any, value: boolean) => {
  const source = field.checks?.removed?.path;
  if (!source?.length) return;
  const path = getFieldPath(field, source);
  let cur = data;
  for (let i = 0; i < path.length - 1; i++) {
    cur = cur?.[path[i]];
  }
  if (cur) cur[path[path.length - 1]] = value;
};

/**
 * 格式化时间范围
 * @param start 开始时间
 * @param end 结束时间
 * @returns 格式化后的时间字符串
 */
export const getTime = (start: any, end: any) => {
  if (!start && !end) return "";
  if (!start) return end;
  if (!end) return start;
  return `${start} - ${end}`;
};
