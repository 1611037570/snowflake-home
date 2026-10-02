import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 房地产/建筑行业品牌公关岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "品牌公关",
        name: "沈岚",
        birthday: "1996.03",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2019.07",
        sex: "女",
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
            name: "上海****文化传播有限公司",
            department: "品牌公关部",
            post: "公关专员",
            city: "上海",
            startTime: "2019.07",
            endTime: "2021.06",
            tags: ["媒体关系", "活动执行"],
            content:
              "<p>服务房地产开发与商业地产客户，负责品牌发布会、媒体沟通会的方案撰写、媒体邀约、现场统筹与发稿复盘，并维护央媒、财经及地产垂直媒体资源。</p><p>累计落地 20 场媒体活动，邀约记者与行业媒体 150 人次，全年发稿 260 篇，项目品牌搜索指数提升 35%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "上海****置业集团有限公司",
            department: "品牌管理中心",
            post: "品牌公关",
            city: "上海",
            startTime: "2021.07",
            endTime: "至今",
            tags: ["品牌传播", "舆情管理"],
            content:
              "<p>负责集团住宅与城市更新产品线的品牌传播，统筹品牌亮相、示范区开放、开盘与交付节点的传播排期，管理媒体资源库与对外统一口径。</p><p>搭建舆情监测与分级响应机制，全年监测信息 12 万条，负面舆情平均响应时长缩短至 4 小时，品牌年度传播声量同比提升 45%。</p>",
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
            name: "城市更新项目品牌亮相传播",
            department: "品牌公关部",
            post: "公关执行",
            city: "上海",
            startTime: "2020.04",
            endTime: "2020.11",
            tags: ["整合传播", "媒体邀约"],
            content:
              "<p>围绕老厂房改造与产业办公定位策划品牌亮相，负责传播主题提炼、媒体探访路线设计以及行业媒体稿件的撰写与发布。</p><p>组织 3 场媒体探访与 1 场行业沙龙，产出原创报道 80 篇，全网曝光 1200 万次。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "高端住宅产品线年度品牌传播",
            department: "品牌管理中心",
            post: "品牌公关",
            city: "上海",
            startTime: "2023.03",
            endTime: "2023.12",
            tags: ["品牌活动", "内容运营"],
            content:
              "<p>统筹产品线年度传播主题与内容规划，落地示范区开放、设计师论坛与业主交付故事等系列传播动作，并联动渠道与销售团队统一物料调性。</p><p>完成 12 场落地活动与 36 篇深度稿件，全网曝光 3000 万次，业主交付口碑内容阅读量突破 50 万。</p>",
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
            college: "新闻传播学院",
            education: "本科",
            mode: "全日制",
            post: "新闻学",
            city: "上海",
            startTime: "2015.09",
            endTime: "2019.06",
            content: "<p>主修新闻采访、传播学概论与媒介经营管理，担任校报采编负责人，负责选题策划与稿件审核。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>传播策划：</strong>熟悉地产项目从土地获取、品牌亮相、开盘到交付的全周期传播节奏，能独立完成传播策略、新闻稿与落地活动方案撰写。</p><p><strong>工具与技术栈：</strong>熟练使用微信公众平台、视频号、抖音企业号、剪映、Photoshop、Premiere Pro、飞书与 Excel，能借助行业数据平台与舆情监测系统完成传播效果复盘和竞品监测。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>具备媒体关系维护与危机公关处理经验，能在突发舆情中快速完成事实核查、口径梳理与媒体沟通，控制信息扩散范围。</p><p>擅长跨部门协作，可统筹设计、渠道、销售与物业团队，把控品牌调性在各类传播物料中的一致性。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "集团年度品牌传播金奖" } },
        { ui: {}, data: { name: "年度优秀员工" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "个人作品集", url: "https://portfolio.example.com/shen-lan" } },
        { ui: {}, data: { name: "微信公众号", url: "https://example.com/wechat/brand-cases" } },
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
  ui: structuredClone(getResumeThemeTemplate("foldedLabel").item.ui),
};

export default resumeData;
