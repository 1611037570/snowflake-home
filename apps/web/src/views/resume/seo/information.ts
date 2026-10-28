import { jobGuideList } from "../guide/data";
import { resignationScoreList } from "../guide/resignationScore/data";
import { offerComparisonMetrics } from "../guide/offerComparison/data";
import { workScheduleOptions } from "../guide/realHourlyWage/data";

/** 功能说明正文来源，由统一页面配置选择。 */
export type InformationKind = "ai" | "guide" | "tools" | "resignation" | "offers" | "hourly" | "statistics" | "settings";

export interface InformationLink {
  /** 相关页面的站内地址。 */
  href: string;
  /** 相关页面的可见名称。 */
  label: string;
}

export interface InformationSection {
  /** 说明分组标题。 */
  title: string;
  /** 按阅读顺序排列的正文段落。 */
  paragraphs: string[];
  /** 分组内可直接抓取的相关页面链接。 */
  links?: InformationLink[];
}

// 功能说明在静态网页与实际页面共同展示，维度名称直接复用工具数据。
export function getInformationSections(kind: InformationKind, english: boolean): InformationSection[] {
  const text = (zh: string, en: string) => english ? en : zh;
  const toolLinks: InformationLink[] = [
    { href: "/resume/tools/resignation-score", label: text("离职决策快速评分", "Resignation decision score") },
    { href: "/resume/tools/offer-comparison", label: text("Offer 对比决策器", "Job offer comparison") },
    { href: "/resume/tools/real-hourly-wage", label: text("真实时薪计算器", "Real hourly wage calculator") },
  ];
  switch (kind) {
    case "statistics":
      return [
        {
          title: text("记录投递与后续进展", "Track applications and follow-ups"),
          paragraphs: [text("在求职统计中记录投递、面试、跟进和录用进展，支持批量录入投递记录，并安排后续跟进。", "Record applications, interviews, follow-ups and offers. Add applications in batches and plan follow-up actions.")],
        },
        {
          title: text("查看求职节奏", "Review your job search progress"),
          paragraphs: [text("有投递或跟进记录后，可查看统计卡片和趋势图，结合记录回顾投递节奏与当前进展。", "Once you have application or follow-up records, use the summary cards and trend chart to review your job search progress.")],
          links: [{ href: "/resume/guide", label: text("阅读求职指南", "Read the job search guide") }, { href: "/resume/tools", label: text("使用求职工具", "Explore job search tools") }],
        },
      ];
    case "settings":
      return [
        {
          title: text("本地数据与简历备份", "Local data and resume backup"),
          paragraphs: [text("通用设置提供本地备份入口，可在浏览器支持并获得目录授权后选择设备上的备份目录。请关注备份状态，并保留需要的简历备份文件。", "General Settings provides local backup options. Choose a folder on your device when your browser supports directory access and you grant permission. Check backup status and keep the backup files you need.")],
        },
        {
          title: text("在哪里配置人工智能模型", "Where to configure AI models"),
          paragraphs: [text("模型服务的添加、测试和助手模型选择在小舟人工智能页面完成，配置后可返回简历编辑器使用对应能力。", "Add and test model providers and choose assistant models on the Skiff AI page, then return to the resume editor to use them.")],
          links: [{ href: "/resume/ai", label: text("配置小舟人工智能", "Configure Skiff AI") }, { href: "/resume/mine", label: text("管理我的简历", "Manage my resumes") }],
        },
      ];
    case "guide":
      // 指南复用页面现有全部分组，避免另写一套摘要替代原正文。
      return jobGuideList.map((group) => ({
        title: group.name, // 现有指南分组标题。
        paragraphs: group.list.map((item) => `${item.title}：${item.content}`), // 原有条目与正文。
      }));
    case "ai":
      return [
        {
          title: text("小舟人工智能可以做什么", "What Skiff AI helps with"),
          paragraphs: [text("配置模型后，可在简历编辑器中生成和润色经历、评估简历、对标目标岗位，并进行翻译与模拟面试。", "After configuring a model, use the resume editor to draft and improve experience, review your resume, match a target role, translate content and practice interviews.")],
        },
        {
          title: text("如何开始使用", "How to get started"),
          paragraphs: [
            text("在本页添加模型服务并测试连接，再为相应助手选择模型。模型服务的可用性和费用以所选服务商为准。", "Add a model provider on this page, test the connection and select a model for each assistant. Availability and charges depend on the selected provider."),
            text("打开或创建简历，在编辑器中选择需要处理的内容并提出要求，检查生成结果后再采用。", "Open or create a resume, choose the content to work on in the editor, give your instructions and review the result before applying it."),
          ],
          links: [{ href: "/resume/mine", label: text("打开我的简历", "Open my resumes") }, { href: "/resume/template", label: text("选择简历范本", "Choose a resume example") }],
        },
      ];
    case "tools":
      return [
        {
          title: text("按问题选择求职工具", "Choose a tool for your decision"),
          paragraphs: [
            text("考虑当前工作是否值得继续，可使用离职决策快速评分，逐项梳理工作条件。", "Use the resignation score to review the conditions of your current job."),
            text("手上有多份录用意向，可使用 Offer 对比决策器，同时比较收入、休息、通勤和岗位条件。", "Compare job offers across pay, time off, commute and role conditions."),
            text("想比较大小周、单休和双休的实际回报，可使用真实时薪计算器，将加班和通勤计入时间成本。", "Use the hourly wage calculator to compare work schedules while including overtime and commuting time."),
          ],
          links: toolLinks,
        },
        {
          title: text("结合条件看结果", "Interpret results in context"),
          paragraphs: [text("工具根据填写的信息提供评分、对比或估算。先核实收入、工时与用工条件，再结合个人目标判断。", "These tools score, compare or estimate using your inputs. Verify pay, working hours and employment terms, then consider your own priorities.")],
          links: [{ href: "/resume/guide", label: text("阅读求职指南", "Read the job search guide") }],
        },
      ];
    case "resignation":
      return [
        {
          title: text("评分包含哪些条件", "What the score covers"),
          paragraphs: [resignationScoreList.map((item) => item.title).join("、")],
        },
        {
          title: text("如何完成评分", "How to complete the score"),
          paragraphs: [text("逐项选择最贴合实际情况的档位，完成全部十项后点击查看结果。每项满分十分，总分由所选档位相加得出；可以修改选择后重新查看。", "Choose the option that best reflects your situation for each of the ten items, then view the result. Each item is worth up to ten points and the total is their sum. Edit your choices to reassess.")],
          links: toolLinks.slice(1),
        },
      ];
    case "offers":
      return [
        {
          title: text("录用条件如何比较", "How offers are compared"),
          paragraphs: offerComparisonMetrics.map((item) => `${item.title}：${item.description}`),
        },
        {
          title: text("如何使用对比结果", "How to use the comparison"),
          paragraphs: [text("添加需要比较的录用条件，逐项填写收入和各维度档位，再查看综合排序与优劣。对不确定的薪酬和福利，先向招聘方核实后再填写。", "Add the offers you want to compare, enter pay and conditions, then review the ranking and tradeoffs. Confirm uncertain pay or benefits with the employer before entering them.")],
          links: [toolLinks[2]!],
        },
      ];
    case "hourly":
      return [
        {
          title: text("支持哪些休息制度", "Supported work schedules"),
          paragraphs: workScheduleOptions.map((item) => `${item.label}：${item.description}`),
        },
        {
          title: text("怎样计算真实时薪", "How to estimate real hourly pay"),
          paragraphs: [text("填写年度现金收入、休息制度、法定节假日休假情况、每日工时、通勤和年假。工具将工作与通勤计入年度占用时间，给出真实时薪和标准双休等价年薪。", "Enter annual cash income, work schedule, public holiday access, daily hours, commute and paid leave. The tool includes work and commuting time to estimate hourly pay and an equivalent salary for a standard five-day week.")],
          links: [toolLinks[1]!],
        },
      ];
  }
}
