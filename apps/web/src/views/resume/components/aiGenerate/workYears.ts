/** 工作年限选项：AI 生成入口统一从这里取选项，调整档位只改这一处。 */
export type WorkYearOption = {
  /** 选项值，直接作为生成资料里的工作年限文本。 */
  value: string;
  /** 展示文案的语言标识，数字年限复用同一条模板。 */
  labelKey: string;
  /** 文案插值参数，数字年限用它替换 {count}。 */
  params?: Record<string, number>;
};

// 数字年限固定从 1 年到 10 年，档位文案由同一条语言模板渲染。
const NUMERIC_YEARS = Array.from({ length: 10 }, (_, index) => index + 1);

export const WORK_YEAR_OPTIONS: WorkYearOption[] = [
  {
    value: "实习生", // 实习阶段的在校生，经验档位最靠前。
    labelKey: "resumeAiGenerateWorkYearsIntern", // 选项展示文案。
  },
  {
    value: "应届生", // 尚未正式入职的毕业生。
    labelKey: "resumeAiGenerateWorkYearsFresh", // 选项展示文案。
  },
  ...NUMERIC_YEARS.map((year) => ({
    value: `${year}年`, // 传给生成能力的年限文本。
    labelKey: "resumeAiGenerateWorkYearsCount", // 数字年限共用文案模板。
    params: { count: year }, // 文案里的年限数字。
  })),
  {
    value: "10年以上", // 十年以上经验单独成档。
    labelKey: "resumeAiGenerateWorkYearsPlus", // 选项展示文案。
  },
];
