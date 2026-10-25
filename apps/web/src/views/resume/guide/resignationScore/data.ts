/** 单个评分档位。 */
export interface ResignationScoreOption {
  /** 该档位对应的分数。 */
  score: number;
  /** 该档位描述的工作现状。 */
  description: string;
}

/** 单项离职决策评分。 */
export interface ResignationScoreItem {
  /** 评分项名称。 */
  title: string;
  /** 评分项可选的四个档位。 */
  options: ResignationScoreOption[];
}

/** 总分对应的决策结果。 */
export interface ResignationScoreResult {
  /** 结果适用的最低分数，包含该分数。 */
  minScore: number;
  /** 结果适用的最高分数，包含该分数。 */
  maxScore: number;
  /** 页面展示的分数区间文案。 */
  rangeLabel: string;
  /** 总分对应的工作评价与建议。 */
  content: string;
}

/** 离职决策的十项评分数据。 */
export const resignationScoreList: ResignationScoreItem[] = [
  {
    title: "到手收入",
    options: [
      { score: 10, description: "发薪准时，月到手 6000 元以上" },
      { score: 6, description: "发薪准时，月到手 4000-6000 元" },
      { score: 3, description: "偶有拖欠，月到手 3000-4000 元" },
      { score: 0, description: "经常拖欠，月到手不足 3000 元" },
    ],
  },
  {
    title: "年终奖金",
    options: [
      { score: 10, description: "稳定发放，金额≥1 个月工资" },
      { score: 6, description: "基本都有，约 0.5-1 个月工资" },
      { score: 3, description: "看公司效益，时有时无" },
      { score: 0, description: "完全没有年终奖" },
    ],
  },
  {
    title: "五险一金",
    options: [
      { score: 10, description: "险种齐全，按实际工资基数缴纳" },
      { score: 6, description: "险种齐全，按当地最低基数缴纳" },
      { score: 3, description: "只有五险，没有住房公积金" },
      { score: 0, description: "不缴社保，或险种不全" },
    ],
  },
  {
    title: "通勤时长",
    options: [
      { score: 10, description: "单程通勤 30 分钟以内" },
      { score: 6, description: "单程通勤 30-60 分钟" },
      { score: 3, description: "单程通勤 60-90 分钟" },
      { score: 0, description: "单程通勤 90 分钟以上" },
    ],
  },
  {
    title: "日常加班",
    options: [
      { score: 10, description: "准点下班，基本不用加班" },
      { score: 6, description: "忙季偶尔加班，可调休 / 有补贴" },
      { score: 3, description: "常态化无偿加班" },
      { score: 0, description: "强制 996 / 无休，无任何补偿" },
    ],
  },
  {
    title: "休假权益",
    options: [
      { score: 10, description: "双休 + 法定假全休 + 带薪年假自由申请" },
      { score: 6, description: "大小周 + 法定假基本保障 + 有带薪年假" },
      { score: 3, description: "单休 + 法定假缩水 + 年假审批受限" },
      { score: 0, description: "无固定休息日，也没有带薪年假" },
    ],
  },
  {
    title: "下班边界",
    options: [
      { score: 10, description: "下班之后完全不聊工作" },
      { score: 6, description: "仅紧急事务偶尔联系" },
      { score: 3, description: "下班经常发工作消息" },
      { score: 0, description: "24 小时待命，休息也常开会" },
    ],
  },
  {
    title: "职场氛围",
    options: [
      { score: 10, description: "领导靠谱不甩锅，同事和谐无内耗" },
      { score: 6, description: "关系平淡，工作互不干扰" },
      { score: 3, description: "偶有打压推诿，轻度精神内耗" },
      { score: 0, description: "PUA 严重，办公室勾心斗角" },
    ],
  },
  {
    title: "成长发展",
    options: [
      { score: 10, description: "有清晰晋升调薪机制，能力提升明显" },
      { score: 6, description: "有固定调薪周期，有一定成长空间" },
      { score: 3, description: "无明确晋升路径，工作重复机械" },
      { score: 0, description: "常年不涨薪，个人能力持续退化" },
    ],
  },
  {
    title: "身心健康",
    options: [
      { score: 10, description: "压力可控，不影响睡眠和情绪" },
      { score: 6, description: "偶有忙碌，休息后很快恢复" },
      { score: 3, description: "长期高压，偶尔失眠、情绪低落" },
      { score: 0, description: "严重透支，身体或情绪出现明显问题" },
    ],
  },
];

/** 总分结果从高到低排列，便于按首个命中区间显示。 */
export const resignationScoreResults: ResignationScoreResult[] = [
  { minScore: 90, maxScore: 100, rangeLabel: "90 分以上", content: "稀缺好工作，好好珍惜" },
  { minScore: 75, maxScore: 89, rangeLabel: "75-89 分", content: "整体优质，不建议盲目离职" },
  { minScore: 60, maxScore: 74, rangeLabel: "60-74 分", content: "普通合格，结合自身需求权衡" },
  { minScore: 45, maxScore: 59, rangeLabel: "45-59 分", content: "性价比偏低，可以开始观望新机会" },
  { minScore: 0, maxScore: 44, rangeLabel: "45 分以下", content: "消耗大于收获，建议尽快规划离职" },
];
