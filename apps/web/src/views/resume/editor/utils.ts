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
