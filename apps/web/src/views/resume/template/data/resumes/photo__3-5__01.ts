import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 大众摄影师简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: {},
      data: {
        position: "商业摄影师",
        name: "陈川",
        birthday: "1998.04",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2020.07",
        sex: "男",
        avatar: xiaoyang,
      },
    },
    skill: {
      ui: { collapsed: ["1"]},
      data: {
        content:
          "<p><strong>1、</strong>熟练使用 Lightroom、Photoshop 与 Capture One，掌握联机拍摄与商业精修流程，能独立完成前期沟通、拍摄执行和后期交付。</p><p><strong>2、</strong>擅长人像、品牌广告与电商产品拍摄，熟悉 Profoto 影棚灯组布光、外景自然光运用及佳能 EOS R5 等全画幅器材实拍。</p>",
      },
    },
    education: {
      ui: { collapsed: ["1"]},
      list: [
        {
          ui: {},
          data: {
            name: "中国传媒大学",
            education: "本科",
            post: "摄影与数字媒体艺术",
            startTime: "2016.09",
            endTime: "2020.06",
            content: "<p>主修摄影造型、视觉叙事、商业摄影与数字图像处理。</p>",
            mode: "全日制",
          },
        },
      ],
    },
    work: {
      ui: { collapsed: ["1"]},
      list: [
        {
          ui: {},
          data: {
            name: "上海****品牌创意有限公司",
            post: "商业摄影师",
            startTime: "2020.07",
            endTime: "至今",
            content:
              "<p>负责服饰、餐饮与生活方式品牌的视觉拍摄，独立完成拍摄方案、棚拍布光与现场执行，年均交付 60 余组商业拍摄。</p><p>使用佳能 EOS R5 联机拍摄并配合 Capture One 完成选片精修，保障成片风格与品牌调性一致，返修率控制在 5% 以内。</p>",
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
            name: "城市咖啡品牌年度视觉拍摄",
            post: "摄影师",
            startTime: "2025.03",
            endTime: "2025.05",
            link: { name: "作品集", url: "https://portfolio.example.com/chen-chuan" },
            content:
              "<p>完成 12 家门店环境、产品静物与人物场景拍摄，交付 200 余张成片与 6 支短视频素材，用于新品上市及社交媒体传播。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "户外服饰春夏新品拍摄",
            post: "摄影师",
            startTime: "2024.04",
            endTime: "2024.06",
            content:
              "<p>负责外景勘察与自然光布置，使用逆光与长焦手法完成模特动态抓拍，交付电商详情页及品牌宣传图共 150 余张。</p>",
          },
        },
      ],
    },
  },
  config: {
    modules: [{ key: "user" }, { key: "education" }, { key: "skill" }, { key: "work" }, { key: "project" }],
  },
  // 界面配置沿用主题预设：与模板页该主题的样式卡片共用同一份配置，保证布局与配色一致。
  ui: structuredClone(getResumeThemeTemplate("vinePaper").item.ui),
};

export default resumeData;
