import { xiaoyang } from "../../avatar";

// 羊老师范本：三年商业摄影经验，覆盖教育、技能、优势、工作与项目等常规模块。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        name: "羊老师",
        position: "商业摄影师",
        birthday: "1999.08",
        sex: "男",
        educationLevel: "本科",
        workTime: "2023.03",
        phone: "158****2637",
        email: "162****380@qq.com",
        city: "上海",
        status: "在职看机会",
        arrivalTime: "两周内到岗",
        salary: "12-18K",
        avatar: xiaoyang,
      },
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "作品集", url: "https://portfolio.example.com/sheep-teacher" } },
        { ui: {}, data: { name: "小红书", url: "https://www.example.com/sheep-teacher/xiaohongshu" } },
        { ui: {}, data: { name: "站酷", url: "https://www.example.com/sheep-teacher/zcool" } },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>拍摄：</strong>熟练使用 Canon EOS R5、Sony A7R V 及 Profoto、Godox 灯光系统，能够独立完成棚拍布光与外景用光。</p><p><strong>后期：</strong>精通 Lightroom、Photoshop 与 Capture One，掌握人像精修、产品去瑕疵与商业调色流程。</p><p><strong>协作：</strong>熟悉拍摄方案撰写、分镜沟通与团队协作流程，能够配合策划与设计把控成片风格。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>具备三年商业摄影经验，长期负责人像、品牌广告与电商产品拍摄，能够根据品牌调性完成从拍摄构思到成片交付的全流程执行。</p><p>审美稳定、沟通顺畅，能够在拍摄进度与成片质量之间做好平衡，按时保质交付素材。</p>",
      },
    },
    education: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "上海****学院",
            college: "传媒与艺术学院",
            education: "本科",
            mode: "全日制",
            post: "摄影与数字媒体艺术",
            city: "上海",
            startTime: "2018.09",
            endTime: "2022.06",
            tags: ["专业前 10%"],
            content:
              "<p>主修摄影造型、商业摄影、视觉叙事与数字图像处理等课程。</p><p>2022 年在校期间进入商业摄影工作室实习，正式入行并参与多场品牌拍摄。</p>",
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
            name: "上海****文化传媒有限公司",
            department: "视觉拍摄部",
            post: "商业摄影师",
            city: "上海",
            startTime: "2023.03",
            endTime: "至今",
            tags: ["独立负责", "人像拍摄"],
            link: { name: "作品集", url: "https://portfolio.example.com/sheep-teacher/works" },
            content:
              "<p>负责品牌人像、商业广告与电商产品拍摄，完成拍摄方案、现场执行、选片调色与后期交付。</p><p>独立跟进中小型拍摄项目，与客户、策划及设计团队协作，保障素材风格与品牌调性一致，年均交付商拍项目 30 余个。</p>",
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
            name: "高端美妆品牌年度形象拍摄",
            department: "视觉拍摄部",
            post: "摄影师",
            city: "上海",
            startTime: "2024.09",
            endTime: "2024.11",
            tags: ["品牌视觉", "已交付"],
            link: { name: "作品集", url: "https://portfolio.example.com/sheep-teacher/beauty" },
            content:
              "<p>完成主视觉、产品静物与模特妆容特写的棚拍布光，统一整体色调与妆面质感。</p><p>产出社媒传播与电商详情页素材 200 余张，成片获客户一次通过。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "户外服饰品牌春夏人像拍摄",
            department: "视觉拍摄部",
            post: "摄影师",
            city: "杭州",
            startTime: "2025.03",
            endTime: "2025.05",
            tags: ["外景拍摄", "团队协作"],
            link: { name: "作品集", url: "https://portfolio.example.com/sheep-teacher/outdoor" },
            content:
              "<p>负责外景勘察、自然光与补光布置，以及模特动态抓拍。</p><p>交付电商详情页与品牌宣传图 150 余张，拍摄周期较排期提前两天完成。</p>",
          },
        },
      ],
    },
    image: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: { name: "美妆主视觉成片", img: xiaoyang, desc: "美妆品牌年度形象拍摄主视觉。展示棚拍布光与妆面质感表现。", size: 50 },
        },
        {
          ui: {},
          data: { name: "户外人像成片", img: xiaoyang, desc: "户外服饰品牌春夏拍摄成片。展示自然光与动态抓拍效果。", size: 50 },
        },
      ],
    },
  },
  config: {
    modules: [
      { key: "user" },
      { key: "account" },
      { key: "education" },
      { key: "skill" },
      { key: "advantage" },
      { key: "work" },
      { key: "project" },
      { key: "image" },
    ],
  },
  ui: {
    page: { padding: { vertical: 24, horizontal: 24 }, spacing: { paragraph: 12, module: 12 }, footer: "" },
    font: { family: "text-puhui", size: 16, titleSize: 22, lineHeight: 1.2 },
    content: { language: "zh", textAlign: "auto", infoSeparator: "space", linkUnderline: false, dateStyle: "dot", datePosition: "right" },
    theme: { template: "blueGoldRibbon", color: "#16A34A", titleIconMode: "icon" }, // 摄影范本改用蓝金双线主题
    layout: { leftColumnWidth: 40 },
    user: { infoMode: "text", infoLayout: "flex", avatarPosition: "right", infoPosition: "left" },
  },
};

export default resumeData;
