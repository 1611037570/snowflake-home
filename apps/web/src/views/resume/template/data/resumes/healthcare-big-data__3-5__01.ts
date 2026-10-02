import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 医疗/健康行业大数据岗位简历示例数据。
const resumeData: any = {
  data: {
    user: { ui: { archived: false }, data: { position: "大数据", name: "韩雨桐", birthday: "1996.05", phone: "15888888888", email: "16****70@qq.com", workTime: "2019.07", sex: "男", city: "上海", avatar: xiaoyang } },
    work: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "上海****智能科技有限公司",
            department: "医疗数据平台部",
            post: "大数据开发工程师",
            city: "上海",
            startTime: "2019.07",
            endTime: "2022.02",
            tags: ["数据接入", "指标开发"],
            content:
              "<p>负责医院信息系统、检验检查设备与健康管理终端的业务数据接入，完成 HIS、LIS、PACS 等系统数据的抽取、清洗与主题建模，支撑临床分析与运营决策。</p><p>搭建患者主索引与就诊事件宽表，落地电子病历文本的结构化处理流程，数据接入及时率提升至 99%，日常报表产出由人工汇总转为自动生成。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "上海****智能科技有限公司",
            department: "健康数据创新中心",
            post: "高级大数据工程师",
            city: "上海",
            startTime: "2022.03",
            endTime: "至今",
            tags: ["数据治理", "实时计算"],
            content:
              "<p>负责健康数据中台的离线和实时链路建设，统一疾病诊断、药品耗材、随访记录等主题域的数据标准与口径，支撑慢病管理、随访提醒和运营看板等业务场景。</p><p>重构核心指标的加工链路，任务平均产出时间缩短 40%，关键指标口径一致率提升至 98%，并通过数据质量校验规则拦截异常上报数据。</p>",
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
            name: "临床检验数据集成与质控平台",
            department: "医疗数据平台部",
            post: "数据开发负责人",
            city: "上海",
            startTime: "2020.03",
            endTime: "2021.06",
            tags: ["数据集成", "质量校验"],
            content:
              "<p>主导检验检查数据的采集与标准化，按照行业数据交换规范完成字段映射、值域字典统一与重复记录合并，接入院内 20 余套业务系统的检验项目数据。</p><p>上线后检验报告调阅与统计的取数时长由小时级降至分钟级，异常结果漏报率下降 35%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "慢病随访与健康风险预警看板",
            department: "健康数据创新中心",
            post: "项目负责人",
            city: "上海",
            startTime: "2022.09",
            endTime: "2024.05",
            tags: ["实时计算", "风险预警"],
            content:
              "<p>基于流式计算构建血压、血糖等指标的实时接入链路，结合随访规则生成分层预警信号，并通过看板向健康管理师推送待随访人群清单。</p><p>项目覆盖 8 类慢病管理场景，预警信号产出延迟控制在 1 分钟以内，重点人群随访完成率提升 22%。</p>",
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
            name: "某某医科大学",
            college: "医学信息工程学院",
            education: "本科",
            mode: "全日制",
            post: "医学信息工程",
            city: "上海",
            startTime: "2015.09",
            endTime: "2019.06",
            content:
              "<p>主修医学信息学、数据结构与算法、数据库原理、统计分析以及健康数据标准与隐私保护相关课程，系统学习医疗业务知识与数据处理方法。</p><p>参与校内健康数据应用实践，负责体检数据的清洗与统计分析，输出人群健康指标汇总报告。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>大数据开发：</strong>熟练使用 Hadoop、Hive、Spark、Flink、Kafka、HBase 与 ClickHouse，能够独立完成离线数仓分层建模与实时流式链路开发，掌握调度编排工具与任务性能调优。</p><p><strong>医疗数据与工具：</strong>熟悉 HL7、FHIR、DICOM 等医疗数据交换规范以及 ICD-10 疾病编码、LOINC 检验项目编码等标准字典，能够使用 SQL、Python、Pandas 与 Airflow 完成数据加工、质量校验与指标开发。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>兼具医疗业务理解与大数据工程能力，熟悉临床、检验与健康管理场景的数据特征，能够把业务口径准确翻译为可实现的数据模型与指标定义。</p><p>重视数据质量与患者隐私合规，习惯通过校验规则和血缘追踪定位问题，善于联动临床科室、运营与技术团队推动数据应用落地。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度数据治理优秀项目奖" } },
        { ui: {}, data: { name: "健康数据创新应用优秀个人" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "技术笔记", url: "https://example.com/healthcare-data-notes" } },
        { ui: {}, data: { name: "GitHub", url: "https://example.com/healthcare-bigdata" } },
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
  ui: structuredClone(getResumeThemeTemplate("doubleArrow").item.ui),
};

export default resumeData;
