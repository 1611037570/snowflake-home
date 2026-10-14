import { xiaoyang } from "../../avatar";

// 未来羊范本：十年以上资深前端履历，突出中后台体系、微前端与跨端基建等大型项目成果。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        name: "未来羊",
        position: "资深前端工程师",
        birthday: "1992.03",
        sex: "男",
        educationLevel: "本科",
        workTime: "2014.07",
        phone: "158****8072",
        email: "162****915@qq.com",
        github: "https://www.example.com/future-yang/github",
        website: "https://portfolio.example.com/future-yang",
        city: "深圳",
        status: "在职看机会",
        arrivalTime: "一个月内到岗",
        salary: "45-60K",
        avatar: xiaoyang,
      },
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "技术博客", url: "https://portfolio.example.com/future-yang/blog" } },
        { ui: {}, data: { name: "开源主页", url: "https://www.example.com/future-yang/open-source" } },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>工程体系：</strong>十年以上前端研发经验，主导中后台体系、微前端架构、跨端研发框架与组件库基建落地，熟悉 Monorepo、CI/CD 与前端监控治理。</p><p><strong>技术栈：</strong>精通 JavaScript、TypeScript、Vue3、React 与 Node.js，熟练使用 Vite、Webpack、Turborepo 与 pnpm 构建工具链。</p><p><strong>性能治理：</strong>擅长首屏加载、包体积与运行时性能优化，具备大规模线上性能问题定位与治理经验。</p><p><strong>团队建设：</strong>具备技术方案评审、代码规范建设与前端团队带教经验，能够推动跨团队技术协同。</p>",
      },
    },
    education: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "****大学",
            college: "计算机科学与技术学院",
            education: "本科",
            mode: "全日制",
            post: "计算机科学与技术",
            city: "武汉",
            startTime: "2010.09",
            endTime: "2014.06",
            tags: ["985", "双一流"],
            content: "<p>主修数据结构、计算机网络、操作系统与软件工程等课程，GPA 3.6/4.0。</p>",
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
            department: "前端技术中心",
            post: "前端技术专家",
            city: "深圳",
            startTime: "2018.07",
            endTime: "至今",
            tags: ["技术负责人", "架构设计"],
            link: { name: "技术分享", url: "https://portfolio.example.com/future-yang/backend-platform" },
            content:
              "<p>负责中后台前端体系的架构设计与演进，主导微前端改造与跨端研发框架建设，服务公司内部 20 余个业务团队。</p><p>搭建组件库与工程化基建，统一研发规范与发布流程，团队需求平均交付周期缩短约 35%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "北京****网络技术有限公司",
            department: "基础技术部",
            post: "高级前端工程师",
            city: "北京",
            startTime: "2014.07",
            endTime: "2018.06",
            tags: ["核心研发", "性能优化"],
            content:
              "<p>参与电商前台与营销活动页面研发，负责首屏渲染与静态资源优化，首页首屏加载时间从 3.2s 降至 1.4s。</p><p>沉淀活动页搭建方案，常用页面开发交付效率提升约 40%。</p>",
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
            name: "中后台组件库与工程化基建",
            department: "前端技术中心",
            post: "项目负责人",
            city: "深圳",
            startTime: "2021.03",
            endTime: "2022.02",
            tags: ["组件库", "已落地"],
            link: { name: "项目说明", url: "https://portfolio.example.com/future-yang/component-lib" },
            content:
              "<p>基于 Monorepo 搭建组件库与脚手架，沉淀 80 余个业务组件及表单、权限等通用能力，接入 20 余个中后台系统。</p><p>业务页面平均开发工时下降约 30%，重复代码明显减少。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "微前端架构改造",
            department: "前端技术中心",
            post: "技术负责人",
            city: "深圳",
            startTime: "2022.05",
            endTime: "2023.04",
            tags: ["微前端", "架构演进"],
            link: { name: "项目说明", url: "https://portfolio.example.com/future-yang/micro-frontend" },
            content:
              "<p>主导存量单体应用向微前端拆分，支持多团队独立开发与独立发布，构建耗时从 18 分钟降至 6 分钟。</p><p>线上发布频率提升一倍，模块故障隔离后影响范围显著缩小。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "跨端统一研发框架",
            department: "前端技术中心",
            post: "技术负责人",
            city: "深圳",
            startTime: "2023.06",
            endTime: "2024.05",
            tags: ["跨端", "性能治理"],
            link: { name: "项目说明", url: "https://portfolio.example.com/future-yang/cross-platform" },
            content:
              "<p>统一 Web、小程序与 App 端的研发范式与构建链路，支撑同一业务多端复用，页面研发成本降低约 45%。</p><p>结合骨架屏与资源预加载治理，核心页面首屏可交互时间从 2.6s 优化至 1.1s。</p>",
          },
        },
      ],
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "公司年度技术贡献奖" } },
        { ui: {}, data: { name: "前端技术委员会核心成员" } },
      ],
    },
  },
  config: {
    modules: [
      { key: "user" },
      { key: "account" },
      { key: "education" },
      { key: "skill" },
      { key: "work" },
      { key: "project" },
      { key: "honor" },
    ],
  },
  ui: {
    page: { padding: { vertical: 24, horizontal: 24 }, spacing: { paragraph: 12, module: 12 }, footer: "" },
    font: { family: "text-puhui", size: 16, titleSize: 22, lineHeight: 1.2 },
    content: { language: "zh", textAlign: "auto", infoSeparator: "dot", linkUnderline: false, dateStyle: "dot", datePosition: "right" },
    theme: { template: "blueBilingual", color: "#2563EB", titleIconMode: "none" }, // 资深前端范本改用蓝色双语主题
    layout: { leftColumnWidth: 40 },
    user: { infoMode: "text", infoLayout: "flex", avatarPosition: "right", infoPosition: "left" },
  },
};

export default resumeData;
