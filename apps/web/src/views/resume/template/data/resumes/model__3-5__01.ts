import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaozhou } from "../avatar";

// 大众模特简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: {
        archived: false,
      },
      data: {
        position: "平面模特",
        name: "林妍",
        birthday: "1999.09",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2021.07",
        sex: "女",
        heightWeight: { height: "172", weight: "52" },
        measurements: { bust: "84", waist: "62", hip: "89" },
        sizes: { top: "S", bottom: "25", shoes: "37" },
        avatar: xiaozhou,
      },
    },
    skill: {
      ui: {
        collapsed: ["1"],
        archived: false,
      },
      data: {
        content:
          "<p><strong>1、</strong>具备平面拍摄、商业广告与品牌活动经验，能根据拍摄主题完成造型与镜头表达，并具备秀场走秀与现场演绎能力。</p><p><strong>2、</strong>熟悉棚拍、外景及短视频拍摄流程，能够高效配合摄影、化妆与造型团队完成创作。</p><p><strong>3、</strong>具备良好的镜头表现力、沟通能力与时间管理能力，可适应不同风格的拍摄需求。</p>",
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
            name: "广州美术学院",
            education: "本科",
            post: "表演与时尚艺术",
            startTime: "2017.09",
            endTime: "2021.06",
            content: "<p>主修表演基础、形体训练与时尚造型，参与校内时尚活动与平面拍摄项目</p>",
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
            startTime: "2021.07",
            endTime: "至今",
            content:
              "<p><strong>2021.8-2022.7：</strong>参与服饰与生活方式品牌平面拍摄，完成产品展示、场景演绎及电商详情页素材拍摄。</p><p><strong>2022.8-2024.2：</strong>合作品牌覆盖女装、美妆与生活方式品类，年均完成 40 余组平面与短视频拍摄，配合完成样片筛选与成片交付。</p><p><strong>2024.3-至今：</strong>参与品牌发布会与线下活动走秀，负责镜头表演、走位配合及现场流程衔接。</p>",
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
            content: "<p>参与服饰品牌春夏系列平面与短视频拍摄，配合造型团队完成 3 组主题造型演绎，成片用于品牌官网与社交媒体投放。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "城市生活方式专题拍摄",
            post: "平面模特",
            startTime: "2024.09",
            endTime: "2024.11",
            content: "<p>完成生活方式主题的棚拍与外景拍摄，覆盖咖啡、家居等场景，累计交付 80 余张成片。</p>",
          },
        },
      ],
    },
  },
  config: {
    modules: [
      { key: "user" },
      { key: "education" },
      { key: "skill" },
      { key: "work" },
      { key: "project" },
    ],
  },
  // 界面配置沿用主题预设：与模板页该主题的样式卡片共用同一份配置，保证布局与配色一致。
  ui: structuredClone(getResumeThemeTemplate("pastelSketch").item.ui),
};

export default resumeData;
