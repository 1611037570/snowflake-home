import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 互联网行业UI/UX岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "UI/UX",
        name: "林向晚",
        birthday: "1997.06",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2019.09",
        sex: "女",
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
            name: "上海****信息科技有限公司",
            department: "用户体验设计部",
            post: "UI 设计师",
            city: "上海",
            startTime: "2019.09",
            endTime: "2022.04",
            tags: ["设计系统", "可用性走查"],
            content:
              "<p>负责企业协同产品的界面设计，主导设计系统与组件库建设，沉淀 90 余个组件与 6 类页面模板，设计交付与前端还原的一致性显著提升。</p><p>建立可用性走查清单并参与每轮版本验收，关键任务操作路径平均缩短两步，新用户首次完成任务成功率提升 18%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "上海****数字科技有限公司",
            department: "设计中心",
            post: "高级 UI/UX 设计师",
            city: "上海",
            startTime: "2022.04",
            endTime: "至今",
            tags: ["用户研究", "体验度量"],
            content:
              "<p>负责金融类 App 的体验 redesign，完成信息架构梳理、关键流程重构与视觉升级，核心开户流程完成率由 61% 提升至 84%。</p><p>搭建体验度量体系，将任务完成率、操作耗时与满意度纳入版本目标，推动三个高频页面完成改版，客诉率下降 42%。</p>",
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
            name: "企业协同产品设计系统建设",
            department: "用户体验设计部",
            post: "设计负责人",
            city: "上海",
            startTime: "2020.08",
            endTime: "2021.10",
            tags: ["组件库", "规范落地"],
            content:
              "<p>梳理栅格、色彩、字号与交互状态规范，输出可复用的组件库并与前端共建设计令牌，设计到开发的还原偏差明显减少。</p><p>系统上线后新页面的设计产出时间缩短 35%，跨团队协作不再依赖口头约定。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "金融 App 开户流程体验重构",
            department: "设计中心",
            post: "体验负责人",
            city: "上海",
            startTime: "2023.02",
            endTime: "2024.03",
            tags: ["流程重构", "可用性测试"],
            content:
              "<p>通过用户访谈与可用性测试定位开户流失卡点，重构表单分组、校验提示与进度反馈，将七步流程压缩为四步。</p><p>改版上线后开户完成率提升 23 个百分点，平均完成时长缩短 40%，相关客服咨询量下降一半。</p>",
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
            name: "同济大学",
            college: "设计创意学院",
            education: "本科",
            mode: "全日制",
            post: "视觉传达设计",
            city: "上海",
            startTime: "2015.09",
            endTime: "2019.06",
            content:
              "<p>主修界面设计、交互设计基础与用户研究方法，系统掌握信息层级、色彩与排版原则。</p><p>毕业设计完成面向老年群体的健康管理工具界面设计，并完成两轮可用性测试验证。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>设计工具：</strong>熟练使用 Figma 搭建组件库与高保真原型，掌握 Sketch、Adobe 系列工具与基础动效制作，能与前端就设计令牌和响应式规则直接对接。</p><p><strong>研究与度量：</strong>掌握用户访谈、可用性测试与卡片分类等研究方法，能将体验问题转化为可度量的指标，熟悉无障碍与多端适配的基本规范。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>既做界面也做流程，习惯先厘清用户任务与业务目标再动手出图，避免只停留在视觉层面的改版。</p><p>重视设计的可落地性，主动与前端共建组件与规范，交付物能直接进入开发流程，返工率低。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度最佳体验改版奖" } },
        { ui: {}, data: { name: "设计系统建设贡献奖" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "作品集", url: "https://example.com/ui-ux-portfolio" } },
        { ui: {}, data: { name: "设计主页", url: "https://example.com/ui-ux-home" } },
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
  ui: structuredClone(getResumeThemeTemplate("violetBiography").item.ui), // 范本沿用紫色履历预设
};

export default resumeData;
