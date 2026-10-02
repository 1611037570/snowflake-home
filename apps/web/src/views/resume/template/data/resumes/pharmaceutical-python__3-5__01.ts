import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 医药/制药行业Python岗位简历示例数据。
const resumeData: any = {
  data: {
    user: { ui: { archived: false }, data: { position: "Python", name: "沈知远", birthday: "1996.05", phone: "15888888888", email: "16****70@qq.com", workTime: "2020.07", sex: "男", city: "上海", avatar: xiaoyang } },
    work: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "上海****智能科技有限公司",
            department: "医药数据智能部",
            post: "Python 开发工程师",
            city: "上海",
            startTime: "2023.09",
            endTime: "至今",
            tags: ["数据平台", "药物警戒"],
            content:
              "<p>负责药物警戒与真实世界研究方向的 Python 服务开发，基于 FastAPI 与 Celery 搭建不良事件数据采集、清洗与入库链路，统一 MedDRA 编码与报告口径，支撑医学团队完成个例安全报告处理。</p><p>主导不良事件信号挖掘平台的规则与统计检测模块迭代，上线后信号识别召回率提升约 25%，单份报告平均处理时长由 40 分钟压缩至 12 分钟。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "上海****医药科技有限公司",
            department: "临床数据技术部",
            post: "Python 开发工程师",
            city: "上海",
            startTime: "2020.07",
            endTime: "2023.08",
            tags: ["临床数据", "自动化脚本"],
            content:
              "<p>负责临床试验数据管理系统的自动化工具开发，使用 Python 对接 EDC 与中心实验室数据接口，实现数据抽取、逻辑核查与 CDISC SDTM 数据集转换，替代原先依赖人工导表核对的方式。</p><p>沉淀可复用的数据核查脚本与异常告警机制，单项目数据清理周期缩短约 35%，核查工单的人工复核量下降约 40%。</p>",
          },
        },
      ],
    },
    project: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "不良事件信号挖掘与报告自动化平台",
            department: "医药数据智能部",
            post: "Python 开发负责人",
            city: "上海",
            startTime: "2024.03",
            endTime: "2025.02",
            tags: ["信号挖掘", "报告自动化"],
            content:
              "<p>整合自发报告、文献与真实世界数据源，基于 Python 建立不良事件去重、MedDRA 编码映射与严重性分级流程，通过比例失衡分析结合医学规则输出信号清单。</p><p>平台上线后信号筛查覆盖的药品与事件组合数量提升 3 倍，高优先级信号的医学确认周期由 5 个工作日缩短至 2 个工作日。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "临床试验数据自动核查与转换工具",
            department: "临床数据技术部",
            post: "Python 开发工程师",
            city: "上海",
            startTime: "2021.11",
            endTime: "2022.10",
            tags: ["逻辑核查", "数据转换"],
            content:
              "<p>面向多个 II 期与 III 期临床项目，使用 pandas 与 SQLAlchemy 构建可配置的核查规则引擎，自动完成访视缺失、日期逻辑与实验室指标范围的批量校验。</p><p>工具支撑 6 个项目的期中数据清理，人工核查工作量下降约 50%，并输出符合 CDISC SDTM 递交要求的数据集。</p>",
          },
        },
      ],
    },
    education: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "上海****大学",
            college: "药学院",
            education: "本科",
            mode: "全日制",
            post: "药学",
            city: "上海",
            startTime: "2016.09",
            endTime: "2020.06",
            content:
              "<p>主修药物分析、药理学、临床药学与生物统计，系统学习药品研发流程与临床试验基础规范。</p><p>毕业设计结合公开药物警戒数据完成不良反应报告的统计分析，并自学 Python 完成数据清洗与可视化。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>开发与数据栈：</strong>熟练使用 Python 开发后端服务与数据处理程序，掌握 FastAPI、Django、Celery、pandas、NumPy、SQLAlchemy、PySpark，熟悉 MySQL、PostgreSQL、MongoDB、Redis，能够使用 Airflow 编排调度任务，并用 pytest 与 GitLab CI 保障交付质量。</p><p><strong>行业工具与规范：</strong>熟悉医药数据场景，掌握 EDC、CTMS、PV 系统与 MedDRA、WHODrug 字典的数据结构，了解 CDISC SDTM 与 ADaM 标准，熟悉 GCP、药品生产质量管理规范相关要求，能够完成数据抽取、逻辑核查、编码映射与合规审计留痕。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>具备药学专业背景与工程开发能力，能够读懂方案、病例报告表与药物警戒术语，把数据质量与合规要求翻译成可落地的技术方案，减少与医学、统计团队之间的沟通损耗。</p><p>习惯用自动化替代重复性人工核对，注重代码可维护性与过程留痕，能够独立负责从需求分析、方案设计到上线验证的完整交付。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "医药数据平台建设优秀项目奖" } },
        { ui: {}, data: { name: "临床数据自动化专项贡献奖" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "GitHub", url: "https://example.com/pharma-python" } },
        { ui: {}, data: { name: "技术作品集", url: "https://example.com/pharma-data-portfolio" } },
      ],
    },
  },
  config: {
    modules: [
      { key: "user" },
      { key: "work" },
      { key: "project" },
      { key: "education" },
      { key: "skill" },
      { key: "advantage" },
      { key: "honor" },
      { key: "account" },
    ],
  },
  // 界面配置沿用主题预设：与模板页该主题的样式卡片共用同一份配置，保证布局与配色一致。
  ui: structuredClone(getResumeThemeTemplate("curvedHeader").item.ui),
};

export default resumeData;
