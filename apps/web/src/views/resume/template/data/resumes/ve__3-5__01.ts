import { xiaozhou } from "../avatar";

// 大众视频剪辑师简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "视频剪辑师",
        name: "周予",
        birthday: "1998.10",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2020.07",
        sex: "女",
        avatar: xiaozhou,
      },
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>1、</strong>熟练使用 Premiere Pro、After Effects 与 DaVinci Resolve，能够完成素材整理、叙事剪辑、调色和包装交付。</p><p><strong>2、</strong>熟悉品牌短片、人物访谈与社交媒体内容的制作节奏，具备镜头语言和音乐节奏把控能力。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content: "<p>具备良好的叙事理解与节奏把控能力，能够根据内容目标完成剪辑、调色和包装交付。</p><p>做事细致负责，善于沉淀制作流程并与团队高效协作。</p>",
      },
    },
    education: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "南京艺术学院",
            education: "本科",
            post: "数字媒体艺术",
            startTime: "2016.09",
            endTime: "2020.06",
            content: "<p>主修影视语言、非线性编辑、声音设计与动态图形设计。</p>",
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
            name: "杭州****新媒体有限公司",
            post: "视频剪辑师",
            startTime: "2020.07",
            endTime: "至今",
            content:
              "<p>负责品牌短视频、活动回顾与人物访谈的剪辑制作，覆盖前期脚本沟通、粗剪、精剪、包装及交付。</p><p>沉淀常用片头、字幕和转场模板，提高团队日常内容生产效率。</p>",
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
            name: "品牌人物纪录短片系列",
            post: "剪辑师",
            startTime: "2025.02",
            endTime: "2025.04",
            link: { name: "作品集", url: "https://portfolio.example.com/zhou-yu" },
            content:
              "<p>完成 6 期人物访谈的叙事结构设计、剪辑、调色与字幕包装，单期平均时长 8 分钟。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "新品上市社交媒体短片",
            post: "剪辑师",
            startTime: "2024.08",
            endTime: "2024.10",
            content:
              "<p>围绕新品卖点剪辑多规格短视频素材，适配品牌官网、信息流与社交平台投放。</p>",
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
    theme: {
      template: "creative", // 视频剪辑范本使用的主题编号
      color: "#DB2777", // 主题强调色
      titleIconMode: "icon", // 标题图标显示方式
    },
    layout: { template: null, custom: null, leftColumnWidth: 40 },
    user: { infoMode: "text", infoLayout: "flex", avatarPosition: "right", infoPosition: "left" },
  },
};

export default resumeData;
