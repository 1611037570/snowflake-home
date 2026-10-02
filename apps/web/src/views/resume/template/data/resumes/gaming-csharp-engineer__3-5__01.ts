import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 游戏行业C#工程师岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "C#工程师",
        name: "沈亦",
        birthday: "1998.05",
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
            department: "客户端研发中心",
            post: "C#工程师",
            city: "上海",
            startTime: "2023.03",
            endTime: "至今",
            tags: ["战斗系统", "性能优化"],
            content:
              "<p>负责 Unity 客户端战斗与技能模块的 C# 开发，搭建技能配置表与行为树驱动的表现框架，支撑玩法快速验证与版本迭代。</p><p>针对同屏战斗场景完成 DrawCall 合批、GC Alloc 与资源加载优化，中低端机型平均帧率提升约 30%，内存峰值下降 20%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "杭州****网络科技有限公司",
            department: "游戏客户端部",
            post: "C#开发工程师",
            city: "杭州",
            startTime: "2020.07",
            endTime: "2023.02",
            tags: ["热更新", "工具链"],
            content:
              "<p>参与 MMORPG 手游客户端研发，使用 C# 与 XLua 完成 UI 框架、任务系统与背包系统的功能实现及热更新适配。</p><p>基于 Addressables 重构资源打包与异步加载流程，首包体积缩减 25%，进入主城场景的加载耗时由 12 秒降至 5 秒。</p>",
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
            name: "多人副本战斗系统重构",
            department: "客户端研发中心",
            post: "C#开发工程师",
            city: "上海",
            startTime: "2024.05",
            endTime: "2025.02",
            tags: ["状态同步", "战斗框架"],
            content:
              "<p>负责状态同步战斗框架的客户端实现，完成技能编辑器、Buff 结算与伤害表现模块，并接入 Protobuf 协议与战斗回放工具。</p><p>重构后战斗模块堆内存分配下降 40%，技能配置异常率控制在 0.5% 以内，支持策划自助配置 200 余条技能数据。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "客户端热更新与资源管理模块",
            department: "游戏客户端部",
            post: "C#开发工程师",
            city: "杭州",
            startTime: "2021.06",
            endTime: "2022.04",
            tags: ["热更新", "资源分包"],
            content:
              "<p>基于 HybridCLR 与 Addressables 搭建 C# 代码热更新和资源分包方案，配套实现编辑器一键打包、差异比对与灰度发布工具。</p><p>热更包体平均缩减 35%，运营活动内容无需发版即可上线，单个版本交付周期缩短约 3 天。</p>",
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
            name: "杭州电子科技大学",
            college: "计算机学院",
            education: "本科",
            mode: "全日制",
            post: "软件工程",
            city: "杭州",
            startTime: "2016.09",
            endTime: "2020.06",
            content:
              "<p>主修数据结构、操作系统、计算机网络与面向对象程序设计，课程设计使用 C# 与 Unity 完成 2D 横版闯关游戏。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>引擎与语言：</strong>熟练使用 C#、.NET 与 Unity3D，掌握 UGUI、DOTween、Addressables、HybridCLR 与 XLua，能够独立完成客户端模块设计与落地。</p><p><strong>游戏开发与工具链：</strong>熟悉状态同步与帧同步战斗流程、Protobuf 协议、行为树与技能配置表；可使用 Unity Profiler 定位 GC Alloc、DrawCall 与内存问题，并通过 Git、Jenkins 完成多平台打包与持续集成。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>具备完整的移动游戏客户端研发经验，能够独立完成需求拆解、模块设计与性能调优，习惯用帧率、内存等数据验证优化效果。</p><p>熟悉策划、美术与服务端的协作流程，沟通主动、交付稳定，能够适应版本节奏下的快速迭代。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度优秀技术贡献奖" } },
        { ui: {}, data: { name: "版本攻坚专项奖" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "GitHub", url: "https://example.com/github/game-client" } },
        { ui: {}, data: { name: "技术博客", url: "https://example.com/blog/unity-csharp" } },
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
  ui: structuredClone(getResumeThemeTemplate("markerGrid").item.ui),
};

export default resumeData;
