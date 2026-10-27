import dayjs from "dayjs";

/**
 * 工作年限计算的取整方式。
 * 默认按实际整年计（满 12 个月才算 1 年）；只有显式开启 round 时才把满 5 个月计入下一年。
 * 两种口径对同一份资料会差出 1 年，属于对外展示口径，必须由简历配置决定，不能写死在计算里。
 */
export interface WorkYearsOptions {
  /** 是否四舍五入：开启后 5-16 个月计 1 年，17-28 个月计 2 年 */
  round?: boolean;
}

const MONTHS_PER_YEAR = 12;
/** 取整口径的月份偏移：让 5 个月及以上落进下一年 */
const ROUND_OFFSET_MONTHS = 7;

/**
 * 按参加工作时间计算工作年限。
 * @param workTime 参加工作时间，格式 YYYY.MM；空值或不可解析时返回 0
 * @param options 取整方式，缺省按实际整年
 */
export const calcWorkYears = (workTime: string, options?: WorkYearsOptions): number => {
  if (!workTime) return 0;

  const startDate = dayjs(workTime);
  if (!startDate.isValid()) return 0;

  const diffInMonths = dayjs().diff(startDate, "month");
  const offset = options?.round ? ROUND_OFFSET_MONTHS : 0;
  const years = Math.floor((diffInMonths + offset) / MONTHS_PER_YEAR);

  return years > 0 ? years : 0;
};
