import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 能源/环保行业Java岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "Java",
        name: "谢文博",
        birthday: "1997.05",
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
            department: "能源数字化研发中心",
            post: "Java 开发工程师",
            city: "上海",
            startTime: "2020.07",
            endTime: "2023.03",
            tags: ["微服务开发", "物联网采集"],
            content:
              "<p>参与分布式光伏电站监控平台的服务端开发，基于 Spring Boot 与 Spring Cloud 完成设备接入、数据采集与告警推送等模块，对接逆变器与智能电表的 Modbus、MQTT 协议并完成点位解析与实时数据落库。</p><p>负责采集链路优化，通过批量写入、Kafka 削峰与缓存策略将单站点数据写入耗时从 800 毫秒降至 200 毫秒以内，平台稳定接入 12000 余台设备。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "上海****能源科技有限公司",
            department: "环保信息化事业部",
            post: "高级 Java 开发工程师",
            city: "上海",
            startTime: "2023.03",
            endTime: "至今",
            tags: ["系统架构设计", "性能调优"],
            content:
              "<p>负责污染源在线监测与碳排放管理平台的架构演进，牵头微服务拆分、分库分表与接口规范制定，主导环保数据上报链路的重构，保障监测数据按时、完整上报至监管平台。</p><p>推动 JVM 调优与 SQL 治理，核心查询平均响应时间下降 60%，平台支撑日均 3000 万条监测数据、800 余家重点排污企业的在线监管业务。</p>",
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
            name: "分布式光伏电站智能监控平台",
            department: "能源数字化研发中心",
            post: "Java 开发工程师",
            city: "上海",
            startTime: "2021.03",
            endTime: "2021.12",
            tags: ["设备接入", "实时计算"],
            content:
              "<p>承担设备接入网关与实时数据服务开发，基于 Netty 与 Kafka 承接逆变器、汇流箱与气象站的秒级上报数据，使用 Flink 完成发电量统计与组串异常识别，并向运维侧提供功率预测与故障工单接口。</p><p>平台上线后覆盖 30 余座集中式与分布式电站，故障平均发现时间从 4 小时缩短至 20 分钟，年度发电量损失降低约 8%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "污染源在线监测数据管理平台",
            department: "环保信息化事业部",
            post: "后端负责人",
            city: "上海",
            startTime: "2024.05",
            endTime: "2025.03",
            tags: ["数据上报", "高可用"],
            content:
              "<p>负责在线监测数据采集、质控与上报服务的整体设计，实现废气废水监测因子的有效性判定、超标预警与异常数据标记，保证上报数据可追溯、可核查。</p><p>通过分库分表与多级缓存改造，平台稳定支撑日均 3000 万条监测数据写入，数据上报完整率提升至 99.9%，接口超时告警下降 85%。</p>",
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
            name: "南京理工大学",
            college: "计算机科学与工程学院",
            education: "本科",
            mode: "全日制",
            post: "计算机科学与技术",
            city: "南京",
            startTime: "2016.09",
            endTime: "2020.06",
            content:
              "<p>主修数据结构与算法、数据库原理、计算机网络与操作系统，系统掌握 Java 面向对象编程与分布式系统基础知识。</p><p>毕业设计完成基于时序数据库的设备监测数据存储与查询优化方案，为能源类数据采集场景打下实践基础。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>开发技术栈：</strong>熟练使用 Java 与 Spring Boot、Spring Cloud Alibaba 进行微服务开发，熟悉 MyBatis、Redis、Kafka、Netty 与 Flink，掌握 MySQL 分库分表、时序数据库 InfluxDB 与 TDengine 的建模与查询优化。</p><p><strong>工程与运维：</strong>熟悉 Docker、Kubernetes、Jenkins 与 Prometheus 监控体系，掌握 JVM 调优、SQL 执行计划分析与链路压测方法，了解 Modbus、MQTT、IEC 104 等能源与环保行业的设备通信协议。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>具备能源与环保行业的业务理解能力，熟悉电站监控、污染源在线监测、环保数据上报与碳排放核算等场景的数据口径与合规要求，能够把现场设备与监管要求翻译成清晰的技术方案。</p><p>擅长高并发采集与海量数据处理系统的设计与调优，遇到线上问题习惯用监控指标、日志与链路数据定位根因，并与产品、运维及现场工程师高效协作推进交付。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度能源数字化优秀项目奖" } },
        { ui: {}, data: { name: "环保数据上报质量先进个人" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "GitHub", url: "https://example.com/energy-java" } },
        { ui: {}, data: { name: "技术博客", url: "https://example.com/energy-java-blog" } },
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
  ui: structuredClone(getResumeThemeTemplate("frame").item.ui),
};

export default resumeData;
