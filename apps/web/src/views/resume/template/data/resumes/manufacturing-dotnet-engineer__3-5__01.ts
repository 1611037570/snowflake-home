import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 制造业行业.NET工程师岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: ".NET工程师",
        name: "曹立恒",
        birthday: "1997.03",
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
            department: "工业软件研发中心",
            post: "高级.NET工程师",
            city: "上海",
            startTime: "2023.03",
            endTime: "至今",
            tags: ["架构设计", "性能调优"],
            content:
              "<p>负责制造执行系统后端架构设计与核心模块开发，基于 .NET 6、ASP.NET Core Web API 与 EF Core 搭建工单、排产和质量追溯服务，打通 ERP 与产线 PLC 的数据链路。</p><p>牵头 OPC UA 采集链路性能优化，单线数据入库延迟由 800ms 降至 150ms，支撑 12 条产线日均 2 万条工单流转，系统月可用率稳定在 99.9%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "苏州****精密机械有限公司",
            department: "智能制造部",
            post: ".NET开发工程师",
            city: "苏州",
            startTime: "2020.07",
            endTime: "2023.02",
            tags: ["MES开发", "车间系统"],
            content:
              "<p>参与离散制造车间 MES 系统开发，负责工单派工、报工与设备状态采集模块，使用 C#、WinForm 与 SQL Server 完成现场终端与后台服务的功能实现。</p><p>重构报工并发处理逻辑并优化存储过程，单班次报工数据处理耗时由 8 分钟缩短至 2 分钟，报工数据准确率提升至 99.9%，现场人工核对工作量减少约 60%。</p>",
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
            name: "MES 工单排产与质量追溯系统",
            department: "工业软件研发中心",
            post: "后端负责人",
            city: "上海",
            startTime: "2024.03",
            endTime: "2025.01",
            tags: ["工单排产", "质量追溯"],
            content:
              "<p>基于 .NET 6 完成工单排产、批次追溯与质检判定的服务拆分，使用 RabbitMQ 解耦产线事件、Redis 缓存批次路由，并向 ERP、WMS 提供统一数据接口。</p><p>上线后计划排产耗时由 4 小时缩短至 30 分钟，批次追溯查询响应控制在 500ms 以内，质量异常定位周期缩短约 70%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "车间设备联网与实时看板",
            department: "智能制造部",
            post: "后端开发",
            city: "苏州",
            startTime: "2021.09",
            endTime: "2022.06",
            tags: ["设备联网", "实时看板"],
            content:
              "<p>对接 30 台数控机床与注塑机的 OPC UA、Modbus TCP 接口，开发数据采集服务、时序存储与 SignalR 实时看板，替代现场人工抄录设备状态与产量。</p><p>设备异常响应时间由 30 分钟缩短至 5 分钟，车间日报统计工作量减少约 70%，为 OEE 分析提供稳定数据源。</p>",
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
            name: "江苏**大学",
            college: "计算机工程学院",
            education: "本科",
            mode: "全日制",
            post: "计算机科学与技术",
            city: "常州",
            startTime: "2016.09",
            endTime: "2020.06",
            content:
              "<p>主修 C# 程序设计、数据库原理、数据结构与工业网络基础，掌握 .NET 平台开发与 SQL Server 数据库设计方法。</p><p>毕业设计围绕车间工单管理系统的设计与实现，独立完成工单下发、报工录入与产量统计模块开发。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>后端开发：</strong>熟练使用 C# 与 .NET Framework/.NET 6，掌握 ASP.NET Core Web API、EF Core、Dapper、SignalR 与异步多线程编程，能独立完成制造业务服务的接口设计与性能调优。</p><p><strong>数据与工业协议：</strong>熟悉 SQL Server、Redis、RabbitMQ、MQTT、OPC UA 与 Modbus TCP，掌握 Docker、Git、Jenkins 部署流程，了解 InfluxDB 时序存储以及 Vue 3 与 Element Plus 前端开发。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>业务理解：</strong>熟悉制造业工单、报工、排产、质检与设备采集流程，能与生产、工艺、设备人员对齐现场诉求，把车间问题转化为可落地的系统方案。</p><p><strong>工程习惯：</strong>重视代码质量与可维护性，习惯通过日志、监控与压测定位性能瓶颈，能在项目节点压力下稳定交付并沉淀技术文档。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "公司年度优秀技术员工" } },
        { ui: {}, data: { name: "智能制造系统建设专项奖" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "GitHub", url: "https://example.com/dotnet-manufacturing" } },
        { ui: {}, data: { name: "技术博客", url: "https://example.com/dotnet-mes-blog" } },
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
  ui: structuredClone(getResumeThemeTemplate("angledLine").item.ui),
};

export default resumeData;
