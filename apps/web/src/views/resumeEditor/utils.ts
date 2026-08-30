/**
 * 设置模块隐藏状态：按字段显隐路径将对应数据置值（true 隐藏 / false 恢复）
 * @param data 简历数据
 * @param field 字段配置（含 checks.hidden.path）
 * @param value 目标隐藏状态
 */
export const setFieldHidden = (data: any, field: any, value: boolean) => {
  const path = field.checks?.hidden?.path;
  if (!path?.length) return;
  let cur = data;
  for (let i = 0; i < path.length - 1; i++) {
    cur = cur?.[path[i]];
  }
  if (cur) cur[path[path.length - 1]] = value;
};

/**
 * 格式化时间范围
 * @param time 时间数组 [开始时间, 结束时间] 或 [时间]
 * @returns 格式化后的时间字符串
 */
export const getTime = (time: any) => {
  if (!time || !Array.isArray(time) || time.length === 0) return "";
  if (time.length === 1) return time[0];
  return `${time[0]} - ${time[1]}`;
};

// 列表模块字段 prop 对应的中文标签（addConfig.model 无 label 时兜底）
const FIELD_LABELS: Record<string, string> = {
  name: "名称",
  url: "链接",
  education: "学位",
  post: "专业",
  time: "时间",
  content: "经历",
  mode: "学制",
};
