import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 互联网行业JavaScript岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "JavaScript",
        name: "许亦然",
        birthday: "1996.11",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2019.06",
        sex: "男",
        city: "杭州",
        avatar: xiaoyang,
      },
    },
    work: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "杭州****网络科技有限公司",
            department: "前端技术部",
            post: "前端开发工程师",
            city: "杭州",
            startTime: "2019.06",
            endTime: "2022.04",
            tags: ["工程化建设", "组件库"],
            content:
              "<p>负责营销活动搭建平台的前端开发，基于 Vue 与 Webpack 搭建可视化拖拽编辑器，沉淀 40 余个业务组件与 12 套活动模板，活动平均上线周期从 3 天缩短至 4 小时。</p><p>主导构建流程优化，通过分包、按需加载与缓存策略将首屏资源体积从 2.4 兆降至 900 千字节以内，首屏渲染时间下降约 55%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "杭州****数据服务有限公司",
            department: "大前端中心",
            post: "高级前端开发工程师",
            city: "杭州",
            startTime: "2022.04",
            endTime: "至今",
            tags: ["Node 中间层", "性能治理"],
            content:
              "<p>负责数据分析平台的前端架构演进，搭建 Node 中间层统一接口聚合与权限校验，前端不再直接依赖后端多套接口，页面接口请求数下降 40%。</p><p>建立前端性能与异常监控体系，覆盖加载耗时、接口成功率与白屏率等指标，推动长列表虚拟滚动与渲染节流改造，平台日均 8 万次访问的卡顿反馈下降 70%。</p>",
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
            name: "营销活动可视化搭建平台",
            department: "前端技术部",
            post: "前端负责人",
            city: "杭州",
            startTime: "2020.05",
            endTime: "2021.06",
            tags: ["低代码", "拖拽编辑"],
            content:
              "<p>设计组件协议与页面描述结构，实现拖拽布局、属性配置与实时预览，支持运营同学零代码搭建落地页并一键发布到多端。</p><p>平台累计产出活动页 600 余个，需求平均交付周期由 3 天压缩到半天，前端从重复性活动中释放约 60% 的人力。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "数据分析平台前端性能治理",
            department: "大前端中心",
            post: "技术负责人",
            city: "杭州",
            startTime: "2023.03",
            endTime: "2024.02",
            tags: ["虚拟滚动", "监控体系"],
            content:
              "<p>针对大数据量报表页卡顿问题，引入虚拟滚动与分片渲染，配合请求合并与缓存复用，万行表格滚动帧率从 20 帧提升至 55 帧以上。</p><p>搭建前端监控看板并与告警打通，上线半年内线上白屏与脚本错误下降 80%，问题平均定位时间缩短至 15 分钟。</p>",
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
            name: "浙江工业大学",
            college: "计算机科学与技术学院",
            education: "本科",
            mode: "全日制",
            post: "软件工程",
            city: "杭州",
            startTime: "2015.09",
            endTime: "2019.06",
            content:
              "<p>主修数据结构、操作系统、计算机网络与软件工程，系统掌握 JavaScript 语言特性与前端工程化基础。</p><p>毕业设计完成基于组件化思想的可视化页面搭建工具原型，为后续低代码方向打下实践基础。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>前端技术栈：</strong>精通 JavaScript 与 TypeScript，熟练使用 Vue 3、React 与 Vite 构建中后台与活动类应用，熟悉 Pinia、Vue Router 与组件库封装，掌握 Webpack、Rollup 的构建配置与体积优化。</p><p><strong>服务端与工程能力：</strong>熟悉 Node.js 与 Express、NestJS 编写中间层服务，掌握 Docker、Nginx 部署与 CI 流水线配置，具备前端性能监控、异常采集与单元测试落地经验。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>长期负责业务平台的前端架构与工程化建设，习惯从构建产物、运行时监控与业务指标三个层面定位问题，能把性能与稳定性目标拆成可落地的改造项。</p><p>具备 Node 中间层与跨端交付经验，能与产品、后端及运维从接口约定一路谈到发布回滚方案，交付节奏可控。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度技术创新奖" } },
        { ui: {}, data: { name: "前端工程质量之星" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "GitHub", url: "https://example.com/js-engineer" } },
        { ui: {}, data: { name: "技术博客", url: "https://example.com/js-engineer-blog" } },
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
  ui: structuredClone(getResumeThemeTemplate("blueStripeResume").item.ui),
};

export default resumeData;
