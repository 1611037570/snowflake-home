import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 电子商务行业SEO/SEM岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "SEO/SEM",
        name: "陆知远",
        birthday: "1997.03",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2019.07",
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
            name: "杭州****电子商务有限公司",
            department: "网络营销部",
            post: "SEO优化专员",
            city: "杭州",
            startTime: "2019.07",
            endTime: "2022.02",
            tags: ["自然流量", "站内优化"],
            content:
              "<p>负责自营商城与平台店铺的整站优化，完成站点结构、类目页与商品详情页的关键词布局，核心品类词排名稳定进入搜索首页。</p><p>通过内链体系与内容专题建设，自然搜索流量年同比增长 85%，自然渠道成交占比由 18% 提升至 32%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "上海****智能科技有限公司",
            department: "数字营销中心",
            post: "SEO/SEM主管",
            city: "上海",
            startTime: "2022.03",
            endTime: "至今",
            tags: ["付费投放", "团队带教"],
            content:
              "<p>统筹品牌在主流搜索引擎的付费投放与自然优化，负责账户结构搭建、关键词分层、创意与落地页优化，年度投放预算约 600 万元。</p><p>通过投放提效与搜索词否词治理，账户整体投产比从 3.1 提升至 4.6，获客成本下降 26%，并带教 3 名投放专员。</p>",
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
            name: "商城整站搜索优化专项",
            department: "网络营销部",
            post: "SEO优化负责人",
            city: "杭州",
            startTime: "2020.04",
            endTime: "2021.08",
            tags: ["自然流量", "结构治理"],
            content:
              "<p>主导商城 12 万个商品页的标题与结构化数据治理，梳理类目关键词矩阵并搭建站内搜索联想与筛选词库。</p><p>专项上线后自然搜索流量提升 92%，商品详情页跳出率下降 14 个百分点。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "全渠道搜索营销投放提效项目",
            department: "数字营销中心",
            post: "项目负责人",
            city: "上海",
            startTime: "2023.05",
            endTime: "2024.03",
            tags: ["付费投放", "投产优化"],
            content:
              "<p>统一搜索引擎与电商站内推广的关键词分层标准，搭建投产比监控看板，按类目制定出价与预算分配策略。</p><p>项目覆盖 8 条核心品类线，大促期间投产比提升 48%，无效点击占比下降 21%。</p>",
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
            name: "浙江工商大学",
            college: "管理工程与电子商务学院",
            education: "本科",
            mode: "全日制",
            post: "电子商务",
            city: "杭州",
            startTime: "2015.09",
            endTime: "2019.06",
            content:
              "<p>主修电子商务概论、网络营销、搜索引擎优化、数据统计与消费者行为学，系统学习搜索算法与商业分析方法。</p><p>在校期间负责校园电商创业团队的商品上架与关键词优化，完成自建站点搜索流量从零到日均 300 次访问。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>搜索优化：</strong>熟悉站点结构优化、关键词布局、内链体系与内容专题建设，能够独立完成整站 SEO 诊断并输出可执行的优化方案。</p><p><strong>投放与数据：</strong>熟练使用 Google Ads、Google Analytics 4、Google Search Console、Ahrefs、Semrush、百度推广与百度统计，并能通过 SQL 与 Excel 完成投放归因与效果复盘。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>具备电商行业搜索流量的全链路操盘经验，能够在自然优化与付费投放之间平衡预算与产出，持续改善投产比。</p><p>习惯用数据验证策略，主动联动运营与研发推动商品结构和落地页优化，落地执行力与跨部门沟通能力较强。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度搜索营销增长之星" } },
        { ui: {}, data: { name: "大促投放提效优秀项目奖" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "个人博客", url: "https://example.com/seo-notes" } },
        { ui: {}, data: { name: "GitHub", url: "https://example.com/seo-tools" } },
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
  ui: structuredClone(getResumeThemeTemplate("colorBar").item.ui),
};

export default resumeData;
