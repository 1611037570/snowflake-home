import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 互联网行业iOS岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "iOS",
        name: "苏梦泽",
        birthday: "1996.08",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2019.07",
        sex: "男",
        city: "北京",
        avatar: xiaoyang,
      },
    },
    work: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "北京****信息技术有限公司",
            department: "移动研发部",
            post: "iOS 开发工程师",
            city: "北京",
            startTime: "2019.07",
            endTime: "2022.03",
            tags: ["Swift 迁移", "模块化"],
            content:
              "<p>负责电商 App 的商品详情与交易链路开发，推动核心模块由 Objective-C 向 Swift 渐进迁移，迁移后新增需求的人日投入下降约 25%。</p><p>完成首页与详情模块的解耦改造，沉淀通用路由与配置化卡片能力，营销位的接入从每次两天缩短到两小时。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "北京****科技有限公司",
            department: "客户端架构组",
            post: "高级 iOS 开发工程师",
            city: "北京",
            startTime: "2022.03",
            endTime: "至今",
            tags: ["SwiftUI", "包体积治理"],
            content:
              "<p>负责效率工具类 App 的客户端架构，引入 SwiftUI 与 Combine 搭建设置、订阅与反馈等模块，界面开发效率提升约 40%，代码行数减少三成。</p><p>主导包体积与启动治理，通过资源按需下发、无用代码裁剪与动态库合并，安装包从 186 兆降至 112 兆，启动首帧时间缩短 35%。</p>",
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
            name: "商品详情页配置化改造",
            department: "移动研发部",
            post: "核心开发",
            city: "北京",
            startTime: "2020.06",
            endTime: "2021.04",
            tags: ["配置化", "动态卡片"],
            content:
              "<p>设计楼层卡片协议与数据驱动渲染方案，详情页楼层由服务端下发配置，运营可自助调整顺序与样式而无需发版。</p><p>改造后营销楼层上线不再依赖客户端排期，大促期间需求交付量提升 3 倍，页面崩溃率保持万分之一以下。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "客户端包体积与启动专项",
            department: "客户端架构组",
            post: "技术负责人",
            city: "北京",
            startTime: "2023.05",
            endTime: "2024.04",
            tags: ["瘦身", "启动优化"],
            content:
              "<p>建立包体积资产台账与增量门禁，清理无用资源与重复图片，推动大图资源转云端下发，安装包净减 74 兆。</p><p>梳理启动任务并按优先级重排，延迟非首屏依赖，冷启动首帧时间由 900 毫秒降至 580 毫秒，应用商店下载转化率提升 12%。</p>",
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
            name: "北京信息科技大学",
            college: "计算机学院",
            education: "本科",
            mode: "全日制",
            post: "计算机科学与技术",
            city: "北京",
            startTime: "2015.09",
            endTime: "2019.06",
            content:
              "<p>主修操作系统、计算机网络与移动应用开发，系统掌握 Objective-C 与 Swift 语言基础及 Cocoa Touch 框架。</p><p>毕业设计完成一款校园二手交易 iOS 应用，涵盖发布、搜索与即时通讯模块。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>客户端开发：</strong>精通 Swift 与 Objective-C 混编开发，熟悉 SwiftUI、Combine 与 MVVM-C 架构，掌握 URLSession、Core Data 与 Widget、通知扩展等系统能力，了解 Swift Concurrency 与异步改造。</p><p><strong>工程与性能：</strong>熟练使用 Instruments 分析卡顿、内存与耗电问题，掌握 CocoaPods 与 Swift Package Manager 依赖管理、包体积瘦身与启动优化，具备灰度发布与崩溃闭环治理经验。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>具备电商与工具类两类 App 的客户端经验，既熟悉高并发营销场景的稳定性要求，也熟悉工具类产品对体积与启动速度的极致追求。</p><p>重视架构演进的渐进性，习惯用可回滚的小步改造替换推倒重来，配合数据指标验证收益，团队协作摩擦小。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度最佳技术改进奖" } },
        { ui: {}, data: { name: "客户端性能治理先进个人" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "GitHub", url: "https://example.com/ios-engineer" } },
        { ui: {}, data: { name: "技术博客", url: "https://example.com/ios-engineer-blog" } },
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
  ui: structuredClone(getResumeThemeTemplate("outline").item.ui),
};

export default resumeData;
