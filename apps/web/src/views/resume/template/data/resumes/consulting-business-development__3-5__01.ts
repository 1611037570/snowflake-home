import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 咨询行业商务拓展岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "商务拓展",
        name: "陈嘉禾",
        birthday: "1996.05",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2018.07",
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
            department: "企业服务事业部",
            post: "高级商务拓展经理",
            city: "上海",
            startTime: "2022.03",
            endTime: "至今",
            tags: ["政企客户", "方案销售"],
            content:
              "<p>负责制造业与零售行业大客户的商务拓展，主导客户开发、需求诊断、方案报价与合同谈判，牵头组织售前、交付与法务资源完成投标闭环。</p><p>任职期间年度签约合同额由 1200 万元提升至 3200 万元，目标完成率 132%，主导的重点项目中标率从 28% 提升至 45%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "杭州****管理咨询有限公司",
            department: "战略咨询部",
            post: "商务拓展顾问",
            city: "杭州",
            startTime: "2018.07",
            endTime: "2022.02",
            tags: ["客户开发", "投标支持"],
            content:
              "<p>负责长三角区域客户线索获取与商机跟进，通过行业沙龙、协会资源与老客户转介绍建立客户关系，配合合伙人完成需求访谈与方案建议书撰写。</p><p>四年累计支撑 60 余个咨询项目签约，合同额约 1800 万元，客户复购率稳定在 65% 以上，连续两年获评部门商务拓展之星。</p>",
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
            name: "汽车零部件集团数字化转型咨询项目",
            department: "企业服务事业部",
            post: "商务负责人",
            city: "上海",
            startTime: "2023.05",
            endTime: "2023.12",
            tags: ["公开投标", "重点项目"],
            content:
              "<p>牵头 8 家竞争对手参与的公开招标，组织 12 轮客户高层访谈与现场调研，输出覆盖生产、供应链与数据治理的解决方案及商务报价。</p><p>项目以 860 万元中标，创部门单笔咨询合同金额纪录，客户次年追加数据中台建设二期合作。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "消费品企业渠道增长诊断项目",
            department: "战略咨询部",
            post: "商务拓展顾问",
            city: "杭州",
            startTime: "2020.09",
            endTime: "2021.03",
            tags: ["方案设计", "线索转化"],
            content:
              "<p>通过行业展会与经销商资源获取客户线索并完成初步诊断，联合咨询顾问设计渠道结构与终端动销改善方案。</p><p>促成 320 万元诊断加落地陪跑合同，方案实施后客户区域门店单店月均销售额提升 18%。</p>",
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
            name: "上海****大学",
            college: "商学院",
            education: "本科",
            mode: "全日制",
            post: "市场营销",
            city: "上海",
            startTime: "2014.09",
            endTime: "2018.06",
            content:
              "<p>主修市场营销、消费者行为学与商务谈判，GPA 3.6/4.0，连续三年获得校级学业奖学金。</p><p>担任商学院职业发展协会外联负责人，组织 6 场企业参访与行业分享活动。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>商务能力：</strong>熟悉大客户销售全流程，能够独立完成客户开发、需求诊断、方案报价、商务谈判与合同签署，熟练运用 SPIN 提问、解决方案销售与价值主张设计等方法论。</p><p><strong>工具与技术栈：</strong>熟练使用 Salesforce、销售易 CRM 管理商机漏斗与销售预测，使用 Power BI、Excel 高级函数与 SQL 完成市场与客户数据分析，使用 PowerPoint、Visio 输出咨询方案与投标文件，熟悉公开招投标与政府采购平台的操作流程。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>具备咨询行业的方案型销售思维，能够快速理解客户业务痛点并将其转化为可量化的解决方案，在客户预算、交付范围与公司利润之间取得平衡。</p><p>擅长跨部门资源协调与高层客户沟通，抗压能力强，可同时推进多条商机并保证签约节奏与回款质量。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度商务拓展冠军" } },
        { ui: {}, data: { name: "优秀投标方案奖" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "领英主页", url: "https://example.com/bd-profile" } },
        { ui: {}, data: { name: "行业洞察专栏", url: "https://example.com/bd-insights" } },
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
  ui: structuredClone(getResumeThemeTemplate("tealRail").item.ui),
};

export default resumeData;
