import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 交通/运输行业运维岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "运维",
        name: "方卓",
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
            department: "基础架构运维部",
            post: "运维工程师",
            city: "上海",
            startTime: "2023.03",
            endTime: "至今",
            tags: ["云原生", "高可用"],
            content:
              "<p>负责轨道交通自动售检票与清分清算系统的生产运维，覆盖线网票务、二维码乘车与聚合支付的日常巡检、变更发布与故障处置，通过 Kubernetes 与 Helm 管理应用编排，借助蓝绿与灰度策略控制上线风险。</p><p>牵头线网票务链路的容量规划与压测，早高峰并发交易承载能力提升 60%，核心系统年度可用性保持 99.99%，故障平均恢复时长由 45 分钟缩短至 12 分钟。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "上海****交通信息技术有限公司",
            department: "系统运维部",
            post: "系统运维工程师",
            city: "上海",
            startTime: "2020.07",
            endTime: "2023.02",
            tags: ["中间件", "监控体系"],
            content:
              "<p>维护公交智能调度、电子站牌与车辆定位接入平台的服务器与中间件，负责 Nginx、Tomcat、Redis、Kafka 与 MySQL 主从集群的部署调优、备份恢复及安全加固，按等保三级要求完成漏洞修复与基线核查。</p><p>推动服务器初始化与巡检工作脚本化，单次批量交付耗时由 6 小时降至 40 分钟，车辆定位数据接入延时下降 35%，累计完成 200 余台服务器自动化纳管。</p>",
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
            name: "线网票务清分系统容器化改造",
            department: "基础架构运维部",
            post: "运维负责人",
            city: "上海",
            startTime: "2024.03",
            endTime: "2025.02",
            tags: ["容器化", "灰度发布"],
            content:
              "<p>将票务清分与对账服务由虚拟机迁移至 Kubernetes 集群，基于 Helm 统一镜像、配置与资源规格，接入 GitLab CI 完成镜像构建、制品扫描与多环境自动发布。</p><p>改造后资源利用率提升 45%，扩缩容由小时级缩短至分钟级，配合灰度与一键回滚完成 60 余次无感发布，清算任务夜间批处理窗口缩短 2 小时。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "交通运营一体化监控告警平台建设",
            department: "系统运维部",
            post: "运维工程师",
            city: "上海",
            startTime: "2021.05",
            endTime: "2022.08",
            tags: ["监控告警", "容量分析"],
            content:
              "<p>整合主机、数据库、中间件与业务埋点指标，使用 Prometheus 与 Grafana 搭建分层看板，配合 ELK 归集应用日志，按线路与业务域配置分级告警和值班触达。</p><p>平台上线后覆盖 300 余项核心指标，无效告警减少 70%，多数异常在用户感知前被发现，年度故障量同比下降 30%。</p>",
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
            name: "上海**大学",
            college: "交通运输学院",
            education: "本科",
            mode: "全日制",
            post: "交通设备与控制工程",
            city: "上海",
            startTime: "2016.09",
            endTime: "2020.06",
            content:
              "<p>主修交通信息系统、计算机网络、数据库原理与自动控制基础，掌握 Linux 系统管理与脚本编程的课程实践。</p><p>毕业设计围绕城市轨道交通客流数据采集与分析，完成数据接入、清洗与可视化展示。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>系统与中间件：</strong>熟练维护 CentOS、Ubuntu 与国产麒麟服务器，掌握 Nginx、Tomcat、Redis、Kafka、MySQL 主从与集群的部署调优和备份恢复，能使用 Shell 与 Python 编写巡检、发布及数据核对脚本。</p><p><strong>云原生与可观测：</strong>熟悉 Docker、Kubernetes 与 Helm 应用编排，基于 GitLab CI、Jenkins 搭建持续集成与发布流水线，使用 Prometheus、Grafana、ELK、Zabbix 建设指标、日志与告警体系，掌握 Ansible、Terraform 完成批量配置与资源编排。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>故障处置：</strong>具备票务、清分与调度类核心系统的快速定位能力，能结合监控指标、日志链路与流量特征界定故障边界，推动研发与厂商协同恢复，重视变更评审与回滚预案。</p><p><strong>运维沉淀：</strong>习惯把重复操作脚本化、流程化，重视值班交接与故障复盘，能在早晚高峰、节假日及大型活动运输保障场景下稳定交付。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "公司年度运维保障先进个人" } },
        { ui: {}, data: { name: "票务清分系统改造优秀项目奖" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "GitHub", url: "https://example.com/transport-devops" } },
        { ui: {}, data: { name: "技术博客", url: "https://example.com/transport-ops-blog" } },
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
  ui: structuredClone(getResumeThemeTemplate("timeline").item.ui),
};

export default resumeData;
