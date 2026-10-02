import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 零售/快消行业市场/营销岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "市场/营销",
        name: "陆明",
        birthday: "1996.08",
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
            name: "上海****食品有限公司",
            department: "市场部",
            post: "市场主管",
            city: "上海",
            startTime: "2023.07",
            endTime: "至今",
            tags: ["快消品", "整合营销"],
            content:
              "<p>负责休闲食品品类的年度营销规划与预算拆解，统筹电商旗舰店、内容平台种草与线下促销档期，年度营销费用 ROI 由 2.1 提升至 3.4。</p><p>搭建会员分层与私域复购体系，联合销售团队推进重点 SKU 的铺市与陈列标准，核心单品月均复购率提升 8 个百分点。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "广州****日化有限公司",
            department: "市场部",
            post: "市场专员",
            city: "广州",
            startTime: "2020.07",
            endTime: "2023.06",
            tags: ["渠道动销", "终端陈列"],
            content:
              "<p>负责华南区域 KA 商超与 CVS 便利店的促销执行，跟进堆头陈列、买赠组合与导购激励，季度档期核销率稳定在 95% 以上。</p><p>参与新品区域铺市计划，落地试吃派样与社区地推活动，区域铺市率由 62% 提升至 85%。</p>",
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
            name: "低糖气泡水新品上市整合营销",
            department: "市场部",
            post: "项目负责人",
            city: "上海",
            startTime: "2024.03",
            endTime: "2024.09",
            tags: ["新品上市", "整合营销"],
            content:
              "<p>主导新品从消费者洞察到上市节奏的完整方案，联合研发与销售确定卖点组合、价格梯度与渠道铺货策略。</p><p>联动抖音与小红书达人种草并配合线下试饮派样，上市首月铺市率达 78%，首季销售额突破 1200 万元。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "年货节全渠道促销战役",
            department: "市场部",
            post: "执行负责人",
            city: "广州",
            startTime: "2022.11",
            endTime: "2023.01",
            tags: ["促销档期", "渠道动销"],
            content:
              "<p>统筹年货节档期的陈列方案、买赠机制与导购激励，覆盖商超、便利店与社区团购共 5 类渠道。</p><p>活动期间重点 SKU 动销率提升 26%，档期销售额同比增长 31%。</p>",
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
            name: "上海大学",
            college: "管理学院",
            education: "本科",
            mode: "全日制",
            post: "市场营销",
            city: "上海",
            startTime: "2016.09",
            endTime: "2020.06",
            content:
              "<p>主修消费者行为学、市场调研与预测、品牌管理与渠道管理，GPA 3.6/4.0。</p><p>担任校营销策划协会负责人，组织校园品牌推广与市场调研实践。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>数据与工具：</strong>熟练使用生意参谋、尼尔森零售监测、凯度消费者指数与 Excel 数据透视表，能够独立完成品类分析、费效比测算与投放复盘。</p><p><strong>营销技能：</strong>熟悉小红书、抖音与天猫旗舰店的种草投放链路，掌握达人筛选、内容脚本撰写、巨量千川投放与私域会员运营方法。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>具备从消费者洞察到终端动销的完整营销视角，能够把品类机会拆解为可落地的渠道策略与内容方案。</p><p>擅长跨部门协同，与销售、电商、供应链及外部代理商高效配合，保证营销节奏按档期落地。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度优秀营销项目奖" } },
        { ui: {}, data: { name: "季度营销创新奖" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: { name: "个人作品集", url: "https://portfolio.example.com/marketing-cases" },
        },
        { ui: {}, data: { name: "知乎专栏", url: "https://www.example.com/marketing-notes" } },
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
  ui: structuredClone(getResumeThemeTemplate("layeredCurve").item.ui),
};

export default resumeData;
