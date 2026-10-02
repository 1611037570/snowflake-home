import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 专业服务行业人力资源岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "人力资源",
        name: "许言",
        birthday: "1997.03",
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
            name: "上海****企业管理咨询有限公司",
            department: "人力资源咨询部",
            post: "人力资源顾问",
            city: "上海",
            startTime: "2019.07",
            endTime: "2022.06",
            tags: ["咨询交付", "客户沟通"],
            content:
              "<p>为制造与零售行业客户提供组织架构梳理、岗位说明书编写与绩效指标设计，累计交付 12 个咨询项目。</p><p>主导 6 家客户的岗位价值评估与职级套改，帮助客户打通薪酬宽带与任职资格体系。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "上海****智能科技有限公司",
            department: "人力资源部",
            post: "人力资源业务伙伴（HRBP）",
            city: "上海",
            startTime: "2022.07",
            endTime: "至今",
            tags: ["业务伙伴", "体系搭建"],
            content:
              "<p>支持研发与交付团队 300 余人的招聘配置、人才盘点与绩效落地，年度招聘完成率保持在 95% 以上。</p><p>推动任职资格与晋升评审流程线上化，关键岗位平均到岗周期由 60 天缩短至 42 天。</p>",
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
            name: "校园招聘与雇主品牌项目",
            department: "人力资源部",
            post: "项目负责人",
            city: "上海",
            startTime: "2023.08",
            endTime: "2023.12",
            tags: ["校园招聘", "雇主品牌"],
            content:
              "<p>统筹 8 所目标院校的宣讲、笔试与面试安排，完成 600 余份简历筛选并录用 45 名应届生。</p><p>设计技术岗测评题干与结构化面试评分表，录用学生转正留存率达到 90%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "岗位职级与薪酬架构优化",
            department: "人力资源咨询部",
            post: "核心顾问",
            city: "上海",
            startTime: "2021.03",
            endTime: "2021.09",
            tags: ["职级体系", "薪酬架构"],
            content:
              "<p>完成 6 个职位序列的岗位价值评估与层级映射，覆盖 5 家客户企业共 1200 余名员工。</p><p>输出薪酬宽带与年度调薪规则，客户人工成本预算执行偏差控制在 3% 以内。</p>",
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
            name: "上海对外经贸大学",
            college: "工商管理学院",
            education: "本科",
            mode: "全日制",
            post: "人力资源管理",
            city: "上海",
            startTime: "2015.09",
            endTime: "2019.06",
            content:
              "<p>主修组织行为学、薪酬管理、劳动法与人才测评，GPA 3.6/4.0。</p><p>担任校就业指导中心学生助理，参与双选会组织与企业对接工作。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>人力系统：</strong>熟练使用 Workday、SAP SuccessFactors、北森与 Moka 招聘系统，能够独立完成招聘漏斗与人员结构分析。</p><p><strong>方法论与工具：</strong>掌握行为面试法（STAR）、九宫格人才盘点、岗位价值评估与薪酬宽带设计，熟练使用 Excel 数据透视表与 Power BI 输出人力看板。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>熟悉专业服务行业以项目制交付为主的用人节奏，能够把业务需求翻译为招聘画像、绩效指标与人才发展方案。</p><p>擅长在多方诉求中推动共识，兼顾合规要求与员工体验，落地过程注重数据验证与复盘。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度优秀咨询顾问" } },
        { ui: {}, data: { name: "人才盘点项目优秀交付奖" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "个人作品集", url: "https://example.com/xu-yan/hr-portfolio" } },
        { ui: {}, data: { name: "行业专栏", url: "https://example.com/xu-yan/hr-notes" } },
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
  ui: structuredClone(getResumeThemeTemplate("topUserTwoColumn").item.ui),
};

export default resumeData;
