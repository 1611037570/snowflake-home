/** Offer 对比维度的数据录入方式。 */
export type OfferMetricInputType = "number" | "choice";

/** Offer 对比维度的优劣方向。 */
export type OfferMetricDirection = "higher" | "lower";

/** Offer 对比维度的稳定标识。 */
export type OfferMetricKey =
  | "annualGuaranteedPackage"
  | "restAndLeaveSystem"
  | "overtimeCompensation"
  | "socialInsuranceFund"
  | "companyScaleNature"
  | "oneWayCommute"
  | "roleContentFit"
  | "promotionTransparency"
  | "probationCompliance"
  | "extraBenefits";

/** 选择型维度的单个档位。 */
export interface OfferMetricChoice {
  /** 档位参与内部比较与计分的数值。 */
  value: number;
  /** 档位展示给用户的完整说明。 */
  label: string;
}

/** 单个 Offer 对比维度。 */
export interface OfferComparisonMetric {
  /** 维度稳定标识。 */
  key: OfferMetricKey;
  /** 维度名称。 */
  title: string;
  /** 维度填写说明。 */
  description: string;
  /** 维度的数据录入方式。 */
  inputType: OfferMetricInputType;
  /** 数值越高或越低代表条件越好。 */
  direction: OfferMetricDirection;
  /** 维度在最终对比中的内部权重。 */
  weight: number;
  /** 数值输入的单位，选择型维度不设置。 */
  unit?: string;
  /** 数值输入允许的最小值，选择型维度不设置。 */
  min?: number;
  /** 数值输入允许的最大值，选择型维度不设置。 */
  max?: number;
  /** 数值输入每次调整的步长，选择型维度不设置。 */
  step?: number;
  /** 数值达到完整得分的参考阈值，选择型维度不设置。 */
  fullScoreThreshold?: number;
  /** 选择型维度的可选档位，数值维度不设置。 */
  options?: OfferMetricChoice[];
}

/** Offer 对比的十个核心维度，内部权重合计为一百分。 */
export const offerComparisonMetrics: OfferComparisonMetric[] = [
  {
    key: "annualGuaranteedPackage",
    title: "年度确定性现金总包",
    description:
      "仅计算写入Offer或有明确制度的全年现金收入，含固定月薪、固定补贴、13薪/固定年终奖、签字费平摊；口头承诺的浮动绩效不算。",
    inputType: "number",
    direction: "higher",
    weight: 26,
    unit: "元",
    min: 0,
    max: 1000000,
    step: 1000,
    fullScoreThreshold: 300000,
  },
  {
    key: "restAndLeaveSystem",
    title: "休息休假制度",
    description: "综合周末休息、法定节假日、带薪年假的整体保障情况，以Offer或公司制度为准。",
    inputType: "choice",
    direction: "higher",
    weight: 13,
    options: [
      { value: 4, label: "标准双休+法定假全休+带薪年假≥10天，休假自由" },
      { value: 3, label: "大小周+法定假正常休+带薪年假5天及以上" },
      { value: 2, label: "单休+法定假缩水+年假审批严格/不足5天" },
      { value: 1, label: "无固定休息日+无带薪年假" },
    ],
  },
  {
    key: "overtimeCompensation",
    title: "加班补偿规则",
    description: "常态化加班对应的补偿机制，面试可直接确认，判断工时性价比。",
    inputType: "choice",
    direction: "higher",
    weight: 10,
    options: [
      { value: 4, label: "基本不加班，或加班按法定标准支付加班费" },
      { value: 3, label: "忙季偶尔加班，可等额调休" },
      { value: 2, label: "常态化加班，无调休也无加班费" },
      { value: 1, label: "强制大小周/996，无偿加班为常态" },
    ],
  },
  {
    key: "socialInsuranceFund",
    title: "五险一金缴纳标准",
    description: "综合险种完整性、缴纳时间、缴费基数三个维度，面试或Offer中可确认。",
    inputType: "choice",
    direction: "higher",
    weight: 10,
    options: [
      { value: 4, label: "入职即缴五险一金，按实际工资基数足额缴纳" },
      { value: 3, label: "入职即缴五险一金，按当地最低基数缴纳" },
      { value: 2, label: "转正后缴纳，或仅缴五险无公积金" },
      { value: 1, label: "不缴社保，或试用期不缴社保" },
    ],
  },
  {
    key: "companyScaleNature",
    title: "公司规模与性质",
    description: "基于公开信息判断，是岗位稳定性最核心的客观参考。",
    inputType: "choice",
    direction: "higher",
    weight: 9,
    options: [
      { value: 4, label: "国企/央企/上市公司，千人以上规模，经营稳健" },
      { value: 3, label: "中型正规企业，融资/盈利稳定，百人以上规模" },
      { value: 2, label: "小型创业公司，融资/盈利情况不明确" },
      { value: 1, label: "微型团队，人员流动大，经营状态不稳定" },
    ],
  },
  {
    key: "oneWayCommute",
    title: "单程通勤时长",
    description: "从出门到抵达工位的全流程平均耗时，含步行、换乘、等车时间。",
    inputType: "number",
    direction: "lower",
    weight: 8,
    unit: "分钟",
    min: 0,
    max: 180,
    step: 5,
    fullScoreThreshold: 15,
  },
  {
    key: "roleContentFit",
    title: "岗位内容匹配度",
    description: "基于JD和面试沟通，判断实际工作内容与你的能力、预期的契合程度。",
    inputType: "choice",
    direction: "higher",
    weight: 7,
    options: [
      { value: 4, label: "高度匹配，核心职责与描述完全一致，符合职业方向" },
      { value: 3, label: "基本匹配，少量杂活，整体符合预期" },
      { value: 2, label: "偏差较大，很多职责面试未提及" },
      { value: 1, label: "严重不符，挂羊头卖狗肉" },
    ],
  },
  {
    key: "promotionTransparency",
    title: "成长晋升透明度",
    description: "面试可直接确认：是否有明确的晋升路径、调薪周期和能力标准。",
    inputType: "choice",
    direction: "higher",
    weight: 7,
    options: [
      { value: 4, label: "有公开透明的晋升调薪机制，路径清晰" },
      { value: 3, label: "有固定调薪周期，晋升有大致标准" },
      { value: 2, label: "无明确晋升规则，全凭领导主观判断" },
      { value: 1, label: "无成长空间，常年不调薪" },
    ],
  },
  {
    key: "probationCompliance",
    title: "试用期合规性",
    description: "以Offer写明的试用期时长、薪资比例为准，判断用工正规度。",
    inputType: "choice",
    direction: "higher",
    weight: 5,
    options: [
      { value: 4, label: "时长合规，试用期薪资全额发放" },
      { value: 3, label: "时长合规，试用期薪资8折发放" },
      { value: 2, label: "试用期超长，或薪资低于法定8折" },
      { value: 1, label: "规则模糊，存在押证、缴费等不合理要求" },
    ],
  },
  {
    key: "extraBenefits",
    title: "补充福利完善度",
    description: "除五险一金外的额外福利，含商业保险、年度体检、餐补房补等。",
    inputType: "choice",
    direction: "higher",
    weight: 5,
    options: [
      { value: 4, label: "福利完善，商业险、体检、各类补贴齐全" },
      { value: 3, label: "有基础福利，含年度体检和少量固定补贴" },
      { value: 2, label: "福利极少，仅节日小额福利" },
      { value: 1, label: "无任何额外福利" },
    ],
  },
];
