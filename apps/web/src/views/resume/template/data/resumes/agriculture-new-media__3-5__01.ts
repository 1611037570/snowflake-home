import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 农业/食品行业新媒体岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "新媒体",
        name: "沈禾",
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
            name: "上海****食品科技有限公司",
            department: "品牌新媒体部",
            post: "新媒体运营主管",
            city: "上海",
            startTime: "2023.07",
            endTime: "至今",
            tags: ["矩阵运营", "直播增长"],
            content:
              "<p>统筹品牌在抖音、小红书、视频号与店铺直播的内容矩阵，负责年度内容预算拆解、达人合作与投放节奏，矩阵账号年度总播放量突破 2.3 亿，粉丝总量由 45 万增至 130 万。</p><p>搭建农产品溯源直播与助农专场，联合供应链团队确定主推品类与价格梯度，直播间月均 GMV 由 180 万元提升至 620 万元，内容引流带来的店铺新客占比提升至 42%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "南京****农业科技有限公司",
            department: "新媒体运营部",
            post: "新媒体运营专员",
            city: "南京",
            startTime: "2020.07",
            endTime: "2023.06",
            tags: ["账号冷启动", "产地内容"],
            content:
              "<p>负责抖音、视频号与微信社群的日常内容运营，围绕时令蔬果与产地溯源策划选题，独立完成脚本、拍摄、剪辑与发布，账号从 0 累计粉丝 12 万，单条最高播放量 860 万。</p><p>搭建内容排期表与产地素材库，把一次产地拍摄复用为短视频、图文与直播切片三种形态，月度内容产出量由 20 条提升至 65 条，粉丝月均净增 1.2 万。</p>",
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
            name: "「田间到餐桌」产地溯源短视频 IP",
            department: "品牌新媒体部",
            post: "项目负责人",
            city: "上海",
            startTime: "2024.03",
            endTime: "2024.10",
            tags: ["内容IP", "产地溯源"],
            content:
              "<p>主导溯源 IP 的内容框架设计，确定产地拍摄标准、人物叙事模板与发布节奏，累计产出 36 期视频，全网播放量 6800 万，账号涨粉 32 万。</p><p>联动质检与供应链团队沉淀产品卖点素材库，带动主推品类站内搜索量增长 55%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "鲜食玉米品类达人种草计划",
            department: "新媒体运营部",
            post: "内容策划",
            city: "南京",
            startTime: "2021.09",
            endTime: "2022.06",
            tags: ["达人种草", "爆文打造"],
            content:
              "<p>负责小红书与抖音达人筛选、脚本共创与投放复盘，累计合作达人 120 位，产出爆文 18 篇，品类话题曝光量达 4200 万。</p><p>配合电商团队承接流量，活动期店铺访客数增长 2.4 倍，下单转化率提升 1.8 个百分点。</p>",
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
            name: "南京农业大学",
            college: "食品科技学院",
            education: "本科",
            mode: "全日制",
            post: "食品质量与安全",
            city: "南京",
            startTime: "2016.09",
            endTime: "2020.06",
            content:
              "<p>主修食品化学、农产品贮藏与加工、食品标准与法规，GPA 3.6/4.0。</p><p>担任校园新媒体中心编辑，负责校园公众号选题策划与图文排版。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>内容制作：</strong>熟练使用剪映专业版、Premiere Pro、Photoshop 与 Canva，能够独立完成农产品短视频的脚本撰写、拍摄分镜、剪辑包装与封面设计。</p><p><strong>平台与数据：</strong>熟悉抖音、小红书、视频号与淘宝直播的运营规则，掌握巨量千川、新抖、蝉妈妈与蒲公英平台的数据分析、达人筛选和投放复盘方法。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>具备食品行业的内容理解力，能够把产地环境、加工工艺与检测标准转译成用户听得懂的卖点表达。</p><p>擅长跨部门协同，与供应链、质检、电商及外部达人团队高效配合，保证内容节奏与销售档期对齐。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度优秀内容运营奖" } },
        { ui: {}, data: { name: "农产品品牌传播创新奖" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: { name: "个人作品集", url: "https://portfolio.example.com/agri-new-media" },
        },
        { ui: {}, data: { name: "内容案例合集", url: "https://www.example.com/agri-cases" } },
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
  ui: structuredClone(getResumeThemeTemplate("sloganBand").item.ui),
};

export default resumeData;
