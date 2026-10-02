import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 金融行业数据分析岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "数据分析",
        name: "沈嘉",
        birthday: "1996.05",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2020.07",
        sex: "男",
        city: "上海",
        avatar: xiaoyang,
      },
    },
    work: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "上海****智能科技有限公司",
            department: "数据智能部",
            post: "高级数据分析师",
            city: "上海",
            startTime: "2023.07",
            endTime: "至今",
            tags: ["风险建模", "团队协作"],
            content:
              "<p>负责信贷与消费金融业务的风险指标体系建设，围绕贷前准入、贷中监控与贷后催收搭建逾期率、迁徙率、不良率等核心指标口径与看板，支撑风控策略评审与月度经营分析。</p><p>牵头搭建反欺诈特征库并落地 A/B 实验，推动高风险客群准入规则迭代，上线后首逾率下降 2.3 个百分点，人工审核工作量减少约 30%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "上海****资产管理有限公司",
            department: "数据运营部",
            post: "数据分析师",
            city: "上海",
            startTime: "2020.07",
            endTime: "2023.06",
            tags: ["经营分析", "报表自动化"],
            content:
              "<p>负责资管产品规模、净值与客户持仓的日常监控，产出周度经营分析报告与业绩归因结论，为产品发行与渠道投放提供数据支持。</p><p>将手工统计报表迁移到自动化调度，报表产出时长从 2 天缩短至 2 小时，数据核对差异率降至 0.1% 以内。</p>",
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
            name: "零售信贷风险预警平台",
            department: "数据智能部",
            post: "数据负责人",
            city: "上海",
            startTime: "2024.03",
            endTime: "2024.11",
            tags: ["风险预警", "指标体系"],
            content:
              "<p>整合征信、还款行为与外部多头借贷数据，构建客户风险分层模型与预警规则，输出高风险客户名单并联动催收队列。</p><p>模型上线后预警名单命中率由 32% 提升至 58%，高风险客户早期介入率提升 45%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "资管产品经营分析看板",
            department: "数据运营部",
            post: "数据分析师",
            city: "上海",
            startTime: "2021.09",
            endTime: "2022.06",
            tags: ["数据看板", "业绩归因"],
            content:
              "<p>梳理产品规模、申赎与净值波动的数据链路，搭建经营分析看板，支持管理层与渠道团队按日追踪产品表现。</p><p>结合业绩归因拆分收益来源，为 3 只重点产品的费率与渠道策略调整提供依据。</p>",
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
            college: "金融学院",
            education: "本科",
            mode: "全日制",
            post: "经济统计学",
            city: "上海",
            startTime: "2016.09",
            endTime: "2020.06",
            content:
              "<p>主修计量经济学、金融统计分析、时间序列分析与风险管理，系统学习统计建模与金融业务基础。</p><p>毕业设计基于公开财报数据完成上市公司财务指标与信用风险的实证分析。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>数据工具：</strong>熟练使用 SQL 完成多表关联与窗口函数取数，使用 Python（pandas、NumPy、scikit-learn、statsmodels）完成数据清洗、特征工程与回归、评分卡等建模工作，使用 Excel 数据透视表与 Power BI、Tableau 输出分析看板。</p><p><strong>金融业务与数据栈：</strong>熟悉信贷风控、资产管理与经营分析场景，掌握 Hive、Spark 处理海量明细数据，了解 MySQL、ClickHouse 与调度平台 Airflow 的任务编排，能够独立设计 A/B 实验并完成显著性检验。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>熟悉银行信贷、消费金融与资管业务的指标口径和监管要求，能够把业务问题翻译成可量化的分析目标，避免只做数据描述而缺少业务结论。</p><p>具备较强的跨部门沟通能力，善于向风控、产品与运营团队解释模型逻辑与数据结论，推动分析结果落地为可执行的策略与流程。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度数据分析优秀项目奖" } },
        { ui: {}, data: { name: "风控建模专项贡献奖" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "GitHub", url: "https://example.com/finance-data-analysis" } },
        {
          ui: {},
          data: { name: "分析作品集", url: "https://example.com/data-analysis-portfolio" },
        },
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
  ui: structuredClone(getResumeThemeTemplate("burgundySidebar").item.ui),
};

export default resumeData;
