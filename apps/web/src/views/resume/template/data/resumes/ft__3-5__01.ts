import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 仓储物流行业外贸岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: {},
      data: {
        position: "外贸",
        name: "郑望舒",
        birthday: "1996.03",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2019.07",
        sex: "女",
        city: "宁波",
        avatar: xiaoyang,
      },
    },
    work: {
      ui: { collapsed: ["1"]},
      list: [
        {
          ui: {},
          data: {
            name: "宁波****国际贸易有限公司",
            department: "国际业务一部",
            post: "外贸业务员",
            city: "宁波",
            startTime: "2019.07",
            endTime: "2022.05",
            tags: ["客户开发", "订单履约"],
            content:
              "<p>负责家居收纳类产品的欧美市场开发，通过展会、B2B 平台与社媒拓客，累计成交新客户 46 家，个人年销售额从 380 万元增长至 920 万元。</p><p>跟进从询盘、打样、合同到出货的全流程，协调工厂、货代与验货机构，订单按期出运率保持在 96% 以上。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "宁波****供应链管理有限公司",
            department: "海外业务部",
            post: "高级外贸专员",
            city: "宁波",
            startTime: "2022.05",
            endTime: "至今",
            tags: ["大客户维护", "跨境物流协同"],
            content:
              "<p>负责北美两家连锁商超客户的年度合作，主导报价策略、验厂整改与季节性备货计划，客户年度采购额提升 65%，复购订单占比超过七成。</p><p>推动与跨境物流团队的周度协同机制，针对旺季舱位与清关风险提前锁舱备货，旺季交期延误率由 12% 降至 3%。</p>",
          },
        },
      ],
    },
    project: {
      ui: { collapsed: ["1"]},
      list: [
        {
          ui: {},
          data: {
            name: "北美连锁商超年度合作项目",
            department: "海外业务部",
            post: "项目负责人",
            city: "宁波",
            startTime: "2023.02",
            endTime: "2024.06",
            tags: ["大客户", "验厂整改"],
            content:
              "<p>牵头完成客户验厂整改与产品合规资料准备，推动工厂通过社会责任与质量体系审核，进入客户核心供应商名单。</p><p>项目首年实现采购额 1600 万元，带动两条新产线投产，客户次年框架合同金额增长 40%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "旺季跨境物流保障方案",
            department: "海外业务部",
            post: "协同负责人",
            city: "宁波",
            startTime: "2023.08",
            endTime: "2024.01",
            tags: ["舱位锁定", "交期保障"],
            content:
              "<p>梳理前两年旺季延误原因，与货代签订舱位保障协议并制定分批出运计划，规避集中发货造成的爆舱与滞港。</p><p>旺季期间重点订单按期出运率达 97%，因延误产生的空运补发成本下降约 80%。</p>",
          },
        },
      ],
    },
    education: {
      ui: { collapsed: ["1"]},
      list: [
        {
          ui: {},
          data: {
            name: "宁波大学",
            college: "外国语学院",
            education: "本科",
            mode: "全日制",
            post: "国际经济与贸易",
            city: "宁波",
            startTime: "2015.09",
            endTime: "2019.06",
            content:
              "<p>主修国际贸易实务、外贸函电与跨文化商务沟通，系统掌握单证、结算与报关报检基础知识。</p><p>在校期间完成外贸单证与跟单流程的模拟实训，取得英语专业八级证书。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"]},
      data: {
        content:
          "<p><strong>业务能力：</strong>熟悉外贸全流程操作，包括询盘报价、打样确认、合同签订、单证制作与收汇结汇，能独立处理信用证与常见清关资料。</p><p><strong>语言与工具：</strong>英语可作为工作语言，熟练撰写英文函电与商务方案，掌握阿里巴巴国际站、社媒拓客工具与基础的数据看板分析。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"]},
      list: [
        { ui: {}, data: { name: "年度销售冠军" } },
        { ui: {}, data: { name: "大客户开拓专项奖" } },
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
      { key: "honor" },
    ],
  },
  // 界面配置沿用主题预设：与模板页该主题的样式卡片共用同一份配置，保证布局与配色一致。
  ui: structuredClone(getResumeThemeTemplate("tealRail").item.ui),
};

export default resumeData;
