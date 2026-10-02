import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 保险行业销售岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "销售",
        name: "侯立新",
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
            department: "个险销售一部",
            post: "保险销售顾问",
            city: "上海",
            startTime: "2019.07",
            endTime: "2022.06",
            tags: ["个险开拓", "新人带教"],
            content:
              "<p>负责重疾险、医疗险与意外险的客户开发与方案讲解，通过社区驻点、企业宣讲和转介绍名单完成月度拜访计划，独立完成需求分析、保额测算与投保资料收集。</p><p>年度累计承保新单 96 件，保费规模 168 万元，13 个月继续率保持在 92% 以上，并协助部门带教 4 名新入职销售。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "上海****保险经纪有限公司",
            department: "高净值客户部",
            post: "高级销售顾问",
            city: "上海",
            startTime: "2022.07",
            endTime: "至今",
            tags: ["高客经营", "年金险"],
            content:
              "<p>面向高净值家庭提供年金险、增额终身寿险与家庭保障规划服务，主导需求访谈、方案比选与保单架构设计，协同核保、理赔与法律顾问推进大额保单落地。</p><p>年度个人保费 460 万元，大额保单 12 件，加保与转介绍贡献占比 45%，客户满意度回访评分 4.9 分。</p>",
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
            name: "社区家庭保障规划专项",
            department: "个险销售一部",
            post: "项目主责人",
            city: "上海",
            startTime: "2021.03",
            endTime: "2021.09",
            tags: ["社区获客", "保单检视"],
            content:
              "<p>联合社区服务中心开展家庭保障检视活动，输出保额缺口测算模板与常见异议应答话术，累计服务家庭 320 户，现场收集有效线索 210 条。</p><p>专项期内团队新单保费环比提升 28%，检视模板被区域推广为标准销售工具。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "高净值客户年金险配置方案",
            department: "高净值客户部",
            post: "方案主讲人",
            city: "上海",
            startTime: "2023.05",
            endTime: "2023.11",
            tags: ["大额保单", "方案路演"],
            content:
              "<p>围绕企业主家庭的资产隔离与养老现金流需求，设计年金险与增额终身寿险组合方案，配套投保人架构与受益人安排建议，并完成三轮客户面谈与方案调整。</p><p>方案最终承保年缴保费 120 万元，成为部门大额保单复制的标准范例。</p>",
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
            college: "金融学院",
            education: "本科",
            mode: "全日制",
            post: "保险学",
            city: "上海",
            startTime: "2015.09",
            endTime: "2019.06",
            content: "<p>主修保险学原理、风险管理、人身保险与金融营销，系统掌握保险产品结构与核保理赔基础知识。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>销售工具：</strong>熟练使用企业微信客户联系、CRM 客户管理系统、保单检视与计划书制作工具，能够独立完成客户建档、拜访跟进与投保流程推进。</p><p><strong>专业能力：</strong>熟悉重疾险、医疗险、年金险与增额终身寿险的产品条款与核保规则，掌握保额缺口测算、家庭保单检视、异议处理及 Excel 与数据看板业绩复盘方法。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content: "<p>具备扎实的保险专业知识与合规意识，能够用通俗语言讲清保障责任与免责条款，帮助客户理解真实需求而不是单纯推销产品。</p><p>抗压能力与自我驱动力强，擅长通过客户经营与转介绍持续积累长期客源，与核保、理赔及服务团队协作顺畅。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度金牌销售奖" } },
        { ui: {}, data: { name: "13 个月继续率优秀个人" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "GitHub", url: "https://example.com/insurance-sales" } },
        { ui: {}, data: { name: "个人主页", url: "https://example.com/insurance-sales-profile" } },
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
  ui: structuredClone(getResumeThemeTemplate("redWhiteSidebar").item.ui),
};

export default resumeData;
