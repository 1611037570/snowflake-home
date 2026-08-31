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

/**
 * 解析 "YYYY.MM"（兼容 "-"、"/"、"年" 分隔）为月份数值（年 * 12 + 月），无效返回 null
 * @param value 时间字符串
 * @returns 月份数值或 null
 */
export const parseMonth = (value: any): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const match = String(value).trim().match(/^(\d{4})[.\-/年](\d{1,2})$/);
  if (!match) return null;
  return Number(match[1]) * 12 + Number(match[2]);
};

/**
 * 检测时间线断层（空窗期）：相邻时间段之间空窗达到阈值即标记
 * @param segments 时间段列表 [{ name, moduleName, start, end }]，时间为 "YYYY.MM"
 * @param threshold 空窗阈值（月），默认 3
 * @returns 断层列表 [{ prevName, nextName, prevEnd, nextStart, gap, moduleName }]
 */
export const detectGaps = (
  segments: Array<{ name: string; moduleName: string; start: any; end: any }>,
  threshold = 3,
) => {
  const gaps: Array<{ prevName: string; nextName: string; prevEnd: string; nextStart: string; gap: number; moduleName: string }> = [];
  // 解析并过滤有效时间段
  const list: Array<{ name: string; moduleName: string; start: any; end: any; startMonth: number; endMonth: number }> = [];
  segments.forEach((seg) => {
    const startMonth = parseMonth(seg.start);
    const endMonth = parseMonth(seg.end);
    if (startMonth !== null && endMonth !== null) {
      list.push({ ...seg, startMonth, endMonth });
    }
  });
  // 按开始时间升序
  list.sort((a, b) => a.startMonth - b.startMonth);

  for (let i = 0; i < list.length - 1; i++) {
    // 循环内索引均在边界内
    const prev = list[i]!;
    const next = list[i + 1]!;
    // 相差完整月份数（结束当月不计入空窗）
    const gap = next.startMonth - prev.endMonth - 1;
    if (gap >= threshold) {
      gaps.push({
        prevName: prev.name,
        nextName: next.name,
        prevEnd: prev.end,
        nextStart: next.start,
        gap,
        moduleName: next.moduleName,
      });
    }
  }
  return gaps;
};
