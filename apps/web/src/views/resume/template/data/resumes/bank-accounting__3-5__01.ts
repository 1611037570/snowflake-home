import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 银行行业财务岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "财务",
        name: "唐婉清",
        birthday: "1996.05",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2019.07",
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
            department: "财务部",
            post: "财务分析主管",
            city: "上海",
            startTime: "2022.07",
            endTime: "至今",
            tags: ["预算管控", "成本优化"],
            content:
              "<p>统筹集团全面预算与月度经营分析，统一成本分摊口径，搭建按部门与产品线划分的损益看板和费用预警机制，预算偏差率由 8% 收窄至 2% 以内。</p><p>主导财务共享中心与费用报销流程线上化改造，月结周期由 7 个工作日压缩至 3 个工作日，年化节约财务费用约 120 万元，年度内外部审计均无重大调整事项。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "上海****银行股份有限公司",
            department: "公司金融部",
            post: "对公客户经理",
            city: "上海",
            startTime: "2019.07",
            endTime: "2022.06",
            tags: ["对公业务", "合规展业"],
            content:
              "<p>负责对公客户的授信申报、贷后管理与综合金融服务，覆盖尽职调查、财务分析与风险评级环节，管户年均存贷规模超 2.8 亿元，资产质量保持零不良。</p><p>推动企业网银与现金管理产品落地，协助客户完成资金归集与供应链对账，带动中间业务收入同比增长 15%，并按要求完成 KYC 与 AML 定期排查。</p>",
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
            name: "集团全面预算管理体系搭建",
            department: "财务部",
            post: "项目负责人",
            city: "上海",
            startTime: "2023.02",
            endTime: "2023.09",
            tags: ["预算管理", "经营分析"],
            content:
              "<p>统一收入、成本与费用的口径与编制模板，明确各部门编制责任与审批节点，将年度预算拆解到季度与产品线，打通业务系统取数链路。</p><p>配套上线月度经营分析与预实对比看板，费用预算偏差率控制在 2% 以内，全年费用支出同比下降 9%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "财务共享中心建设",
            department: "财务部",
            post: "财务核算负责人",
            city: "上海",
            startTime: "2024.03",
            endTime: "2024.12",
            tags: ["共享中心", "流程优化"],
            content:
              "<p>梳理费用报销、发票认证与付款审批流程，设计凭证自动生成与影像归档规则，明确各节点的内控要求，实现资金支付与账务处理相互稽核。</p><p>月结周期由 7 个工作日压缩至 3 个工作日，付款审批一次通过率提升至 96%，人工凭证录入量下降 40%。</p>",
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
            name: "上海财经大学",
            college: "会计学院",
            education: "本科",
            mode: "全日制",
            post: "会计学",
            city: "上海",
            startTime: "2015.09",
            endTime: "2019.06",
            content: "<p>主修财务会计、审计学、税法与金融学，系统掌握账务处理、报表编制与财务分析方法。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>财务专业：</strong>熟悉全盘账务处理、合并报表、全面预算、成本管控与税务申报，掌握银行信贷业务中的授信申报、贷后管理与风险评级流程，具备 KYC、AML 与监管报送实操经验。</p><p><strong>工具与技术：</strong>熟练使用 SAP FICO、用友 NC 与金蝶 EAS 财务模块，以及 Excel 数据透视与 Power Query；能使用 SQL、Python 完成财务数据清洗与自动化取数，并用 Tableau 搭建经营分析看板。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>财务基础扎实，账务处理与报表编制保持零差错，能在合规前提下平衡业务效率与风险管控要求，熟悉银行内控与外部审计的检查要点。</p><p>擅长用数据支撑经营决策，能够跨部门推动流程与口径统一，将复杂财务问题拆解为可落地的改进动作并持续跟进闭环。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度优秀员工" } },
        { ui: {}, data: { name: "预算管理专项奖" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [{ ui: {}, data: { name: "GitHub", url: "https://example.com/xxx" } }],
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
  ui: structuredClone(getResumeThemeTemplate("sandSidebar").item.ui),
};

export default resumeData;
