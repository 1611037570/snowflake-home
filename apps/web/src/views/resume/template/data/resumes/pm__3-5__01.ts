import { xiaoyang } from "../avatar";

// 全字段产品经理简历，用于完整展示全部模块与并列信息分隔效果。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        name: "李然",
        position: "高级产品经理",
        birthday: "1996-06",
        sex: "男",
        marital: "未婚",
        nation: "汉族",
        zodiac: "双子座",
        mbti: "ENTJ",
        workTime: "2019.07",
        phone: "15888888888",
        email: "16****70@qq.com",
        wechat: "liran_pm",
        github: "https://github.com/liran-pm",
        linkedin: "https://www.linkedin.com/in/liran-pm",
        status: "在职看机会",
        political: "中共党员",
        city: "上海",
        nativePlace: "江苏南京",
        currentCity: "上海",
        salary: "30-40K",
        heightWeight: { height: "178", weight: "70" },
        measurements: { bust: "96", waist: "78", hip: "94" },
        sizes: { top: "L", bottom: "32", shoes: "42" },
        avatar: xiaoyang,
      },
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "个人作品集", url: "https://portfolio.example.com/li-ran" } },
        { ui: {}, data: { name: "知乎", url: "https://www.zhihu.com/people/li-ran" } },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content: "<p><strong>产品能力：</strong>熟悉用户研究、需求分析、原型设计、数据分析与项目管理，能够独立推进 0-1 产品落地。</p><p><strong>工具：</strong>熟练使用 Figma、Axure、SQL、Excel 与数据看板工具。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content: "<p>具备跨团队协作与复杂项目拆解能力，能够在业务目标、用户体验与研发成本之间完成平衡。</p><p>擅长通过数据分析定位增长机会，并推动策略从验证到规模化落地。</p>",
      },
    },
    education: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "同济大学",
            college: "经济与管理学院",
            education: "本科",
            mode: "全日制",
            post: "信息管理与信息系统",
            city: "上海",
            startTime: "2015.09",
            endTime: "2019.06",
            tags: ["985", "双一流"],
            link: { name: "毕业设计", url: "https://portfolio.example.com/li-ran/graduation" },
            content: "<p>GPA 3.7/4.0，主修管理信息系统、数据分析与用户行为研究。</p><p>参与校园创新项目，负责用户调研与产品方案设计。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "南京市金陵中学",
            education: "高中",
            mode: "全日制",
            city: "南京",
            startTime: "2012.09",
            endTime: "2015.06",
            content: "<p>完成高中阶段课程学习，打下扎实的数理与人文基础。</p><p>积极参与校园社团活动，培养沟通协作与组织能力。</p>",
          },
        },
      ],
    },
    work: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "上海****科技有限公司",
            department: "增长产品部",
            post: "高级产品经理",
            city: "上海",
            startTime: "2022.03",
            endTime: "至今",
            tags: ["核心成员", "跨部门协作"],
            link: { name: "产品案例", url: "https://portfolio.example.com/li-ran/growth" },
            content: "<p>负责会员增长与营销自动化产品，搭建分层触达策略和实验平台，推动核心转化链路持续优化。</p><p>协同运营、研发与数据团队迭代关键场景，提升会员激活与复购表现。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "杭州****网络有限公司",
            department: "商业产品部",
            post: "产品经理",
            city: "杭州",
            startTime: "2019.07",
            endTime: "2022.02",
            tags: ["独立负责", "从0到1"],
            content: "<p>负责商家后台和数据报表产品，完成需求调研、原型设计、研发协同及上线后的数据复盘。</p><p>梳理商家核心工作流程，持续优化功能易用性与业务处理效率。</p>",
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
            name: "会员生命周期运营平台",
            department: "增长产品部",
            post: "项目负责人",
            city: "上海",
            startTime: "2024.04",
            endTime: "2024.11",
            tags: ["已上线", "团队协作"],
            link: { name: "项目复盘", url: "https://portfolio.example.com/li-ran/lifecycle" },
            content: "<p>整合用户分群、自动化触达与实验分析能力，支持运营团队自助配置活动并追踪转化效果。</p><p>项目上线后运营配置效率提升，关键营销活动转化率得到改善。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "商家经营数据看板",
            department: "商业产品部",
            post: "产品负责人",
            city: "杭州",
            startTime: "2021.03",
            endTime: "2021.10",
            tags: ["数据产品", "已上线"],
            content: "<p>整合订单、用户与营销数据，帮助商家及时了解经营表现和变化趋势。</p><p>通过指标体系与异常提醒优化日常经营决策效率。</p>",
          },
        },
      ],
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度优秀产品奖" } },
        { ui: {}, data: { name: "用户增长专项奖" } },
      ],
    },
    video: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "产品方案讲解",
            url: "https://www.example.com/product-demo",
            desc: "会员生命周期运营平台的方案讲解与演示视频。介绍用户分层、自动触达和效果分析流程。",
          },
        },
        {
          ui: {},
          data: {
            name: "用户增长复盘",
            url: "https://www.example.com/growth-review",
            desc: "拆解会员增长实验的设计与结果。总结关键指标变化及后续优化方向。",
          },
        },
      ],
    },
    image: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "产品原型展示",
            img: xiaoyang,
            desc: "会员运营后台核心页面原型。展示运营配置与活动效果分析视图。",
            size: 50,
          },
        },
        {
          ui: {},
          data: {
            name: "用户增长数据看板",
            img: xiaoyang,
            desc: "展示用户分层与转化漏斗原型。覆盖核心增长指标及运营分析视图。",
            size: 50,
          },
        },
      ],
    },
    custom_product_research: {
      ui: { title: "行业研究", collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "本地生活行业增长研究",
            department: "战略产品组",
            post: "研究负责人",
            city: "上海",
            startTime: "2023.06",
            endTime: "2023.09",
            tags: ["独立负责", "跨部门协作"],
            link: { name: "研究报告", url: "https://portfolio.example.com/li-ran/research" },
            content: "<p>访谈商家与消费者并完成竞品分析，为下一阶段业务增长策略提供决策依据。</p><p>结合行业数据识别重点细分场景，输出可执行的产品机会与验证建议。</p>",
          },
        },
      ],
    },
  },
  config: {
    meta: { version: "1.0.0" },
    drag: true,
    dragClass: ".container-drag",
    fields: [
      { key: "user" },
      { key: "account" },
      { key: "education" },
      { key: "skill" },
      { key: "advantage" },
      { key: "work" },
      { key: "project" },
      { key: "honor" },
      { key: "video" },
      { key: "image" },
      { key: "custom_product_research" },
    ],
  },
  ui: {
    language: "zh",
    paddingVertical: 24,
    paddingHorizontal: 24,
    fontSize: 16,
    titleFontSize: 22,
    lineHeight: 1.2,
    paragraphSpacing: 12,
    moduleSpacing: 12,
    themeColor: "#2563EB",
    themeTemplate: "modern",
    fontFamily: "text-puhui",
    userInfoMode: "text",
    userInfoLayout: "flex",
    avatarPosition: "right",
    infoPosition: "left",
    dateStyle: "dot",
    datePosition: "right",
    textAlign: "auto",
    titleIconMode: "none",
    linkUnderline: false,
    infoSeparator: "dot",
  },
};

export default resumeData;
