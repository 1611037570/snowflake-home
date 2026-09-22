import { xiaoyang } from "../avatar";

// 大众摄影师简历示例数据。
export const photographerResumeItem: any = {
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
    meta: { version: "1.0.0" },
    drag: true,
    dragClass: ".container-drag",
    fields: [{ key: "user" }, { key: "education" }, { key: "skill" }, { key: "work" }, { key: "project" }],
  },
  ui: {
    language: "zh",
    paddingVertical: 24,
    paddingHorizontal: 24,
    fontSize: 16,
    titleFontSize: 22,
    lineHeight: 1.2,
    paragraphSpacing: 12,
    moduleSpacing: 12,
    themeColor: "#2563EB",
    fontFamily: "text-puhui",
    themeTemplate: "modern",
    userInfoMode: "text",
    avatarPosition: "right",
  },
};

export const photographerResumeTemplate = {
  id: "photographer-chen-chuan",
  name: "摄影师简历",
  description: "适合商业摄影、品牌视觉与电商拍摄岗位的简历范本",
  scene: ["social-recruitment"],
  industry: ["culture-media", "advertising"],
  position: ["photographer"],
  workExperience: ["3-5"],
  design: ["single-column", "minimal"],
  tags: ["商业摄影", "视觉拍摄", "作品集"],
  item: photographerResumeItem,
};
