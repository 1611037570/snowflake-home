import { xiaozhou } from "../avatar";

const resumeData: any = {
  data: {
    slogan: {
      ui: { archived: false },
      data: {
        title: "个人简历",
        subtitle: "在追求中发现可能，在创造中实现价值",
      },
    },
    user: {
      ui: { archived: false },
      data: {
        name: "林知远",
        position: "产品经理",
        sex: "女",
        birthday: "1996.04",
        phone: "13800000000",
        email: "linzhiyuan@example.com",
        city: "深圳",
        workTime: "2019.07",
        avatar: xiaozhou,
      },
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>1、</strong>熟练使用 Axure、Figma 与数据分析工具，能独立完成需求调研、原型设计与效果复盘。</p><p><strong>2、</strong>具备跨团队协作与项目推进能力，能够协调设计、研发与运营按期交付。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>擅长从用户反馈与数据表现中定位问题，并把结论落成可执行的产品方案。</p><p>习惯用指标验证结果，能持续迭代产品细节而非停留在方案层面。</p>",
      },
    },
    education: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "华南理工大学",
            education: "本科",
            post: "信息管理与信息系统",
            startTime: "2015.09",
            endTime: "2019.06",
            content: "<p>主修数据结构、统计学与产品设计基础。</p>",
            mode: "全日制",
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
            name: "深圳****科技有限公司",
            post: "产品经理",
            startTime: "2021.03",
            endTime: "2024.06",
            content:
              "<p>负责会员增长方向的需求规划与迭代，主导改版上线后转化率提升明显。</p><p>搭建指标看板，把核心链路拆成可观测节点，推动跨团队按周复盘。</p>",
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
            name: "会员权益改版项目",
            post: "产品负责人",
            startTime: "2023.02",
            endTime: "2023.09",
            content:
              "<p>梳理权益结构与用户分层，输出三档权益方案并推动落地。</p><p>上线后会员续费率与人均使用频次均有提升。</p>",
          },
        },
      ],
    },
  },
  config: {
    modules: [
      { key: "slogan" },
      { key: "user" },
      { key: "skill" },
      { key: "advantage" },
      { key: "education" },
      { key: "work" },
      { key: "project" },
    ],
  },
  ui: {
    page: {
      padding: { vertical: 24, horizontal: 24 },
      spacing: { paragraph: 12, module: 12 },
      footer: "",
    },
    font: { family: "text-puhui", size: 16, titleSize: 22, lineHeight: 1.2 },
    content: {
      language: "zh",
      textAlign: "auto",
      infoSeparator: "space",
      linkUnderline: false,
      dateStyle: "dot",
      datePosition: "right",
    },
    theme: {
      template: "default",
      color: "#334155",
      titleIconMode: "none",
      userModule: "auto",
      module: "auto",
      item: "auto",
    },
    // 顶部标语与个人信息各自独占通栏区域，区域间距让色带与下文之间留出白边
    layout: { type: "topUserSingleColumn", columns: null, leftColumnWidth: 40 },
    user: { infoMode: "text", infoLayout: "flex", avatarPosition: "left", infoPosition: "left" },
  },
};

export default resumeData;
