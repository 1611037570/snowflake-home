/**
 * 按日期样式格式化单个时间
 * @param value 原始时间，形如 2026.09
 * @param style 日期样式：dot 点号（2026.9）/ cn 中文（2026年9月）
 * @returns 格式化后的时间字符串，无法解析时原样返回
 */
const formatDate = (value: any, style: string) => {
  const matched = String(value ?? "").match(/^(\d{4})\D+(\d{1,2})/);
  if (!matched) return value;
  const year = matched[1];
  const month = Number(matched[2]);
  return style === "cn" ? `${year}年${month}月` : `${year}.${month}`;
};

/**
 * 格式化时间范围
 * @param start 开始时间
 * @param end 结束时间
 * @param style 日期样式：dot 点号（2026.9）/ cn 中文（2026年9月）
 * @returns 格式化后的时间字符串
 */
export const getTime = (start: any, end: any, style = "dot") => {
  if (!start && !end) return "";
  if (!start) return formatDate(end, style);
  if (!end) return formatDate(start, style);
  return `${formatDate(start, style)} - ${formatDate(end, style)}`;
};
