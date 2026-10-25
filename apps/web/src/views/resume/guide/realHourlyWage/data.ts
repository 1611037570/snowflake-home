/** 工作休息制度的稳定标识。 */
export type WorkScheduleKey =
  | "doubleWeekend"
  | "alternatingWeekend"
  | "singleWeekend"
  | "fixedMonthlyRest";

/** 法定节假日休假情况的稳定标识。 */
export type HolidayRestKey = "full" | "partial" | "none";

/** 单个工作休息制度。 */
export interface WorkScheduleOption {
  /** 休息制度的稳定标识。 */
  key: WorkScheduleKey;
  /** 休息制度的展示名称。 */
  label: string;
  /** 休息制度的估算说明。 */
  description: string;
  /** 按五十二周折算的年度固定休息天数，自定义月休不设置。 */
  annualRestDays?: number;
}

/** 单个法定节假日休假档位。 */
export interface HolidayRestOption {
  /** 法定节假日档位的稳定标识。 */
  key: HolidayRestKey;
  /** 法定节假日档位的展示名称。 */
  label: string;
  /** 法定节假日档位的估算说明。 */
  description: string;
  /** 当前档位参与计算的年度休息天数。 */
  annualRestDays: number;
}

/** 每年用于周末制度估算的周数。 */
export const weeksPerYear = 52;

/** 真实时薪计算器支持的休息制度。 */
export const workScheduleOptions: WorkScheduleOption[] = [
  {
    key: "doubleWeekend",
    label: "标准双休",
    description: "每周休息两天，按全年休息一百零四天估算。",
    annualRestDays: weeksPerYear * 2,
  },
  {
    key: "alternatingWeekend",
    label: "大小周",
    description: "双休与单休交替，按全年平均休息七十八天估算。",
    annualRestDays: weeksPerYear * 1.5,
  },
  {
    key: "singleWeekend",
    label: "单休",
    description: "每周休息一天，按全年休息五十二天估算。",
    annualRestDays: weeksPerYear,
  },
  {
    key: "fixedMonthlyRest",
    label: "固定月休",
    description: "按公司规定填写每月固定休息天数。",
  },
];

/** 法定节假日按现行十三天标准提供的简化休假档位。 */
export const holidayRestOptions: HolidayRestOption[] = [
  {
    key: "full",
    label: "正常休完",
    description: "法定节假日正常休息或能够等额补休，按十三天计算。",
    annualRestDays: 13,
  },
  {
    key: "partial",
    label: "只能休部分",
    description: "法定节假日只能休一部分，按七天估算。",
    annualRestDays: 7,
  },
  {
    key: "none",
    label: "基本不能休",
    description: "法定节假日通常仍需上班且没有补休，按零天计算。",
    annualRestDays: 0,
  },
];
