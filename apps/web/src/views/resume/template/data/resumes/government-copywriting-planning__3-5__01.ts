import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 政府/公共事业行业文案/策划岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "文案/策划",
        name: "冯书宁",
        birthday: "1996.05",
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
            name: "上海****政务服务信息有限公司",
            department: "政务内容部",
            post: "文案策划主管",
            city: "上海",
            startTime: "2023.07",
            endTime: "至今",
            tags: ["政务新媒体", "内容统筹"],
            content:
              "<p>统筹政务新媒体矩阵的内容策划与发布，负责政策解读、新闻通稿、工作简报与主题宣传方案撰写，全年成稿 600 余篇，账号累计阅读量突破 1200 万，粉丝规模同比增长 45%。</p><p>牵头建立选题库与三级审核流程，稿件一次通过率由 78% 提升至 92%，平均成稿周期缩短 1.5 天；组织政务公开与政策宣讲活动 20 余场，覆盖群众 1.2 万人次。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "上海****文化传播有限公司",
            department: "政务文案部",
            post: "文案策划",
            city: "上海",
            startTime: "2020.07",
            endTime: "2023.06",
            tags: ["公文写作", "活动策划"],
            content:
              "<p>负责政府网站与政务公众号的日常内容更新，撰写政策解读、办事指南与民生服务类稿件，三年累计成稿 800 余篇，其中 30 余篇被上级单位转载。</p><p>参与文明城市创建、垃圾分类等主题宣传活动，策划图解、H5 与短视频内容 40 余组，办事指南类内容推动页面平均停留时长提升 30%。</p>",
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
            name: "高频政务服务事项办事指南文案标准化改造",
            department: "政务内容部",
            post: "项目负责人",
            city: "上海",
            startTime: "2024.03",
            endTime: "2024.10",
            tags: ["文案标准", "流程梳理"],
            content:
              "<p>梳理 120 项高频政务服务事项的办理条件、材料清单与常见问题，输出统一的办事指南文案模板与话术规范，并组织业务科室完成三轮内容校对。</p><p>改造后指南页面群众满意度达 96%，咨询电话中「材料不清」类问题下降 35%，模板后续推广至区级政务服务平台。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "惠企惠民政策解读专栏策划",
            department: "政务文案部",
            post: "文案策划",
            city: "上海",
            startTime: "2021.09",
            endTime: "2022.06",
            tags: ["政策解读", "专栏策划"],
            content:
              "<p>围绕营商环境与民生保障政策策划解读专栏，采用图解、问答与情景短剧等形式完成 40 期内容，累计阅读量 380 万次。</p><p>同步沉淀政策口径核对清单与解读稿件写作指引，专栏内容被上级单位转载 12 次，成为政策宣传的常设栏目。</p>",
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
            name: "上海****大学",
            college: "人文与传播学院",
            education: "本科",
            mode: "全日制",
            post: "汉语言文学",
            city: "上海",
            startTime: "2016.09",
            endTime: "2020.06",
            content:
              "<p>主修现代汉语、中国古代文学、新闻采访与写作、公文写作与应用文、传播学概论，系统掌握公文规范与新闻稿件写作方法。</p><p>在校担任校报编辑与新媒体运营，累计发表通讯与评论稿件 60 余篇，参与校园文化活动策划与执行。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>文案与策划：</strong>熟悉公文写作规范与政务文风要求，能够独立完成政策解读、新闻通稿、领导讲话稿、工作简报、宣传方案与活动策划案的撰写，掌握选题策划、信息核实与稿件审核流程。</p><p><strong>工具与技术栈：</strong>熟练使用 Word 与 WPS 完成公文排版与套版，使用 Excel 完成选题排期与传播数据统计，使用 Photoshop、秀米与 135 编辑器完成政务图文排版与政策图解设计，使用剪映完成宣传短视频剪辑，借助政务网站内容管理系统与舆情监测平台完成内容发布和效果跟踪。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>熟悉政府与公共事业的内容生产流程，理解政策发布口径与政务文风要求，能够在时效性、准确性与可读性之间把握平衡，把政策文件转化为群众看得懂的解读内容。</p><p>沟通协调与文字表达能力较强，善于对接业务科室梳理素材、组织多部门联合宣传，具备活动统筹与舆情应对意识，能适应时间紧、要求高的宣传任务。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "市级优秀政务新媒体作品奖" } },
        { ui: {}, data: { name: "政务信息工作先进个人" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: { name: "政务文案作品集", url: "https://example.com/government-copywriting" },
        },
        {
          ui: {},
          data: { name: "政策解读专栏合集", url: "https://example.com/policy-interpretation" },
        },
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
  ui: structuredClone(getResumeThemeTemplate("userBand").item.ui),
};

export default resumeData;
