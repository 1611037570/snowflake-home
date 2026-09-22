import { xiaozhou } from "../avatar";

// 大众模特简历示例数据。
export const modelResumeItem: any = {
  data: {
    user: {
      ui: {
        archived: false,
      },
      data: {
        position: "平面模特",
        name: "林妍",
        birthday: "2000-07",
        phone: "158****2637",
        email: "linyan@example.com",
        workTime: "2022.08.01",
        sex: "女",
        avatar: xiaozhou,
      },
    },
    account: {
      ui: {
        collapsed: ["1"],
        archived: false,
      },
      list: [],
    },
    skill: {
      ui: {
        collapsed: ["1"],
        archived: false,
      },
      data: {
        content:
          "<p><strong>1、</strong>具备平面拍摄、商业广告与品牌活动经验，能根据拍摄主题完成造型与镜头表达。</p><p><strong>2、</strong>熟悉棚拍、外景及短视频拍摄流程，能够高效配合摄影、化妆与造型团队完成创作。</p><p><strong>3、</strong>具备良好的镜头表现力、沟通能力与时间管理能力，可适应不同风格的拍摄需求。</p>",
      },
    },
    education: {
      ui: {
        collapsed: ["1"],
        archived: false,
      },
      list: [
        {
          ui: {},
          data: {
            name: "***艺术学院",
            education: "本科",
            post: "表演与时尚艺术",
            startTime: "2021.09",
            endTime: "2023.06",
            content: "<p>参与校内时尚活动与平面拍摄项目</p>",
            mode: "全日制",
          },
        },
      ],
    },
    work: {
      ui: {
        collapsed: ["1"],
        archived: false,
      },
      list: [
        {
          ui: {},
          data: {
            name: "浙江****文化传媒有限公司",
            post: "平面模特",
            startTime: "2022.08",
            endTime: "2026.06",
            content:
              "<p><strong>2023.5-2024.2：</strong>参与服饰与生活方式品牌平面拍摄，完成产品展示、场景演绎等内容创作。</p><p><strong>2024.3-2025.2：</strong>配合品牌完成电商详情页与社交媒体素材拍摄，保障拍摄进度与成片质量。</p><p><strong>2025.2-2026.4：</strong>参与品牌短视频与线下活动拍摄，负责镜头表演和现场配合。</p>",
          },
        },
      ],
    },
    project: {
      ui: {
        collapsed: ["1"],
        archived: false,
      },
      list: [
        {
          ui: {},
          data: {
            name: "品牌春夏系列视觉拍摄",
            post: "平面模特",
            startTime: "2025.03",
            endTime: "2025.05",
            content: "<p>参与服饰品牌春夏系列平面与短视频拍摄。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "城市生活方式专题拍摄",
            post: "平面模特",
            startTime: "2024.09",
            endTime: "2024.11",
            content: "<p>完成生活方式主题的棚拍与外景拍摄。</p>",
          },
        },
      ],
    },
    video: {
      ui: {
        collapsed: [],
        hidden: false,
        archived: false,
      },
      list: [
        {
          ui: {},
          data: {
            name: "作品展示",
            url: "",
            desc: "平面与短视频作品展示",
          },
        },
      ],
    },
    image: {
      ui: {
        collapsed: [],
        hidden: false,
        archived: false,
      },
      list: [],
    },
  },
  config: {
    meta: {
      version: "1.0.0",
    },
    drag: true,
    dragClass: ".container-drag",
    fields: [
      { key: "user" },
      { key: "account" },
      { key: "education" },
      { key: "skill" },
      { key: "work" },
      { key: "project" },
      { key: "video" },
    ],
  },
  ui: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    fontSize: 16,
    titleFontSize: 22,
    lineHeight: 1.2,
    paragraphSpacing: 12,
    moduleSpacing: 12,
    themeColor: "#ff4d4f",
    fontFamily: "text-puhui",
    themeTemplate: "default",
    userInfoMode: "text",
    avatarPosition: "right",
  },
};

export const modelResumeTemplate = {
  id: "model-lin-yan",
  name: "林妍",
  description: "适合平面与商业拍摄岗位展示的简历模板",
  scene: ["social-recruitment"],
  industry: ["culture-media", "advertising"],
  position: ["model"],
  workExperience: ["3-5"],
  design: ["single-column"],
  tags: ["商业拍摄", "作品展示"],
  item: modelResumeItem,
};
