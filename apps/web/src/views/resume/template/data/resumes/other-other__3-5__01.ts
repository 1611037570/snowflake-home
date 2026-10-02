import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 其他行业其他岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "其他",
        name: "马晨菲",
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
            department: "运营管理中心",
            post: "综合运营主管",
            city: "上海",
            startTime: "2022.06",
            endTime: "至今",
            tags: ["流程治理", "跨部门协同"],
            content:
              "<p>统筹公司综合运营事务，负责季度经营例会组织、跨部门事项督办与流程制度建设，牵头梳理并落地 26 项标准作业流程，事项平均闭环周期由 12 个工作日缩短至 6 个工作日。</p><p>负责年度运营预算执行跟踪、办公采购与供应商集中管理，通过比价机制与合同台账管理，行政办公类费用同比下降 15%，全年输出经营分析月报 12 份、专项复盘报告 8 份。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "苏州****综合服务有限公司",
            department: "综合管理部",
            post: "综合运营专员",
            city: "苏州",
            startTime: "2019.07",
            endTime: "2022.05",
            tags: ["综合事务", "数据报表"],
            content:
              "<p>负责综合管理部日常运营支持，涵盖会议组织、公文与档案管理、固定资产盘点及办公用品采购，独立维护固定资产台账 1200 余项，年度盘点差异率控制在 0.5% 以内。</p><p>搭建部门数据统计模板，按周输出运营看板与督办清单，将月度数据汇总耗时由 3 个工作日压缩至 4 小时，为管理层决策与年度审计提供资料支撑。</p>",
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
            name: "运营审批流程线上化改造项目",
            department: "运营管理中心",
            post: "项目负责人",
            city: "上海",
            startTime: "2023.03",
            endTime: "2024.06",
            tags: ["流程线上化", "系统落地"],
            content:
              "<p>调研各部门审批堵点，梳理申请、审批、归档三类节点的流转规则与权限矩阵，推动 OA 与协同办公平台的审批流配置上线，覆盖用印、采购、报销等 14 类常用流程。</p><p>项目上线后线上审批覆盖率达 95%，纸质单据用量下降 80%，流程平均流转耗时缩短 55%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "综合服务标准化建设专项",
            department: "综合管理部",
            post: "执行负责人",
            city: "苏州",
            startTime: "2020.05",
            endTime: "2021.09",
            tags: ["标准建设", "服务提效"],
            content:
              "<p>梳理前台接待、会议服务、物资领用与工单响应等场景的服务标准与检查清单，建立月度巡检与满意度回访机制，配套培训各部门接口人 30 余名。</p><p>专项落地后内部服务满意度由 82% 提升至 94%，重复报修与返工工单下降 30%。</p>",
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
            name: "苏州大学",
            college: "管理学院",
            education: "本科",
            mode: "全日制",
            post: "工商管理",
            city: "苏州",
            startTime: "2015.09",
            endTime: "2019.06",
            content:
              "<p>主修管理学原理、组织行为学、运营管理、应用统计与行政管理学，系统学习组织流程设计与运营分析方法。</p><p>在校期间担任学生会办公室负责人，统筹会议组织与跨院系活动协调，累计策划执行校级活动 10 余场。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>运营与流程：</strong>熟悉 SOP 梳理、流程再造、会议督办与跨部门协同机制，能够独立完成制度文件、经营分析报告与项目排期管理，掌握 OKR、PDCA 与节点复盘方法。</p><p><strong>工具与数据：</strong>熟练使用飞书、钉钉与 OA 审批系统，能用 Excel 数据透视与 Power Query 完成台账和报表自动化，掌握 Visio 流程图、XMind 思维导图与 Power BI 经营看板，具备基础 SQL 取数能力。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>具备综合事务统筹经验，能在多任务并行、跨部门诉求交织的场景下判断优先级，保证关键事项按时闭环并主动同步进展。</p><p>习惯用流程与模板沉淀重复性工作，擅长把模糊需求拆解为可执行、可检查的动作，并联动业务、财务与行政团队共同落地。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度优秀员工" } },
        { ui: {}, data: { name: "流程优化专项奖" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "个人作品集", url: "https://example.com/portfolio" } },
        { ui: {}, data: { name: "GitHub", url: "https://example.com/ops-notes" } },
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
  ui: structuredClone(getResumeThemeTemplate("slantedLayer").item.ui),
};

export default resumeData;
