import { xiaoyang } from "../avatar";

// 大众摄影师简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "商业摄影师",
        name: "陈川",
        birthday: "1998-04",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2020.07.01",
        sex: "男",
        avatar: xiaoyang,
      },
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>1、</strong>熟练使用 Lightroom、Photoshop 与 Capture One，能够独立完成前期沟通、拍摄执行和后期精修。</p><p><strong>2、</strong>具备人像、品牌广告与电商产品拍摄经验，熟悉棚拍布光、外景用光及团队协作流程。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content: "<p>具备扎实的视觉审美与现场执行能力，能够根据品牌调性完成拍摄构思、布光和成片交付。</p><p>沟通协作意识强，能够在拍摄进度与作品质量之间做好协调。</p>",
      },
    },
    education: {
      ui: { collapsed: ["1"], archived: false },
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
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "上海****品牌创意有限公司",
            post: "商业摄影师",
            startTime: "2020.07",
            endTime: "至今",
            content:
              "<p>负责服饰、餐饮与生活方式品牌的视觉拍摄，完成拍摄方案、现场执行、选片及后期交付。</p><p>与客户、策划及设计团队协作，保障素材风格与品牌调性一致。</p>",
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
            name: "城市咖啡品牌年度视觉拍摄",
            post: "摄影师",
            startTime: "2025.03",
            endTime: "2025.05",
            link: { name: "作品集", url: "https://portfolio.example.com/chen-chuan" },
            content:
              "<p>完成门店环境、产品静物与人物场景拍摄，为新品上市及社交媒体传播提供视觉素材。</p>",
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
              "<p>负责外景勘察、自然光布置与模特动态抓拍，交付电商详情页和品牌宣传图。</p>",
          },
        },
      ],
    },
  },
  config: {
    modules: [{ key: "user" }, { key: "education" }, { key: "skill" }, { key: "advantage" }, { key: "work" }, { key: "project" }],
  },
  ui: {
    page: { padding: { vertical: 24, horizontal: 24 }, spacing: { paragraph: 12, module: 12 }, footer: "" },
    font: { family: "text-puhui", size: 16, titleSize: 22, lineHeight: 1.2 },
    content: { language: "zh", textAlign: "auto", infoSeparator: "space", linkUnderline: false, dateStyle: "dot", datePosition: "right" },
    theme: { template: "modern", color: "#2563EB", titleIconMode: "none", userModule: "auto", module: "auto", item: "auto" },
    layout: { template: null, custom: null, leftColumnWidth: 40 },
    user: { infoMode: "text", infoLayout: "flex", avatarPosition: "right", infoPosition: "left" },
  },
};

export default resumeData;
