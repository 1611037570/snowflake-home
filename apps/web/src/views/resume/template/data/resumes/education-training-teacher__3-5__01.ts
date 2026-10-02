import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 教育培训行业教师岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "教师",
        name: "罗静怡",
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
            name: "上海****教育科技有限公司",
            department: "数学教研组",
            post: "数学教研组长",
            city: "上海",
            startTime: "2023.07",
            endTime: "至今",
            tags: ["教研管理", "课程研发"],
            content:
              "<p>统筹初中数学全年课程规划与教研排期，牵头 12 名教师的集体备课、磨课与公开课评审，每学期完成 40 余份教案与配套练习的审核定稿，保障各校区课程标准与授课节奏一致。</p><p>搭建学情数据看板，按月复盘班级平均分、及格率与续班率，主责年级期末统考平均分较上一学年提升 6.5 分，续班率由 72% 提升至 86%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "上海****教育培训有限公司",
            department: "教学中心",
            post: "初中数学教师",
            city: "上海",
            startTime: "2020.07",
            endTime: "2023.06",
            tags: ["班课教学", "学情跟踪"],
            content:
              "<p>承担初一至初三数学班课与一对一教学，独立完成学情诊断、分层教案编写、课堂讲授与课后答疑，累计授课 2600 余课时，班均人数稳定在 20 人左右。</p><p>为薄弱学生建立错题档案与专项训练计划，所带毕业班中考数学平均分 128 分（满分 150 分），一学期内提分 15 分以上的学生占比 42%。</p>",
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
            name: "初中数学分层教学课程体系升级",
            department: "数学教研组",
            post: "项目负责人",
            city: "上海",
            startTime: "2024.03",
            endTime: "2024.12",
            tags: ["分层教学", "课程研发"],
            content:
              "<p>梳理初一至初三知识点图谱与能力分层标准，输出 A/B/C 三层课程大纲、配套讲义与随堂测评题库，覆盖 120 余个中考核心考点。</p><p>方案在 8 个班级试点落地，试点班级期末平均分提升 5.8 分，教师每周备课时间平均节省 4 小时，后续推广至全校区数学学科。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "中考数学专题冲刺班教学方案",
            department: "教学中心",
            post: "主讲教师",
            city: "上海",
            startTime: "2021.09",
            endTime: "2022.06",
            tags: ["中考冲刺", "提分方案"],
            content:
              "<p>围绕函数、几何证明与统计概率三大高频模块设计 16 讲专题课程，配套真题分层训练与限时模拟测评，沉淀为可复用的冲刺班教学包。</p><p>首期班 32 名学生中考数学平均提分 18 分，130 分以上人数占比由 25% 提升至 47%。</p>",
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
            name: "南京师范大学",
            college: "数学科学学院",
            education: "本科",
            mode: "全日制",
            post: "数学与应用数学（师范）",
            city: "南京",
            startTime: "2016.09",
            endTime: "2020.06",
            content:
              "<p>主修数学分析、高等代数、概率统计、数学教学论与教育心理学，系统掌握中学数学知识体系与课堂教学设计方法。</p><p>在校完成教育实习与师范生技能训练，独立承担 30 余课时中学数学试讲，获评校级师范生教学技能竞赛奖项。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>教学能力：</strong>熟悉初中数学课程体系与中考命题趋势，能够独立完成学情诊断、分层教学设计、教案与讲义编写、课堂讲授及课后跟踪，掌握启发式提问、变式训练与错题归因等方法。</p><p><strong>工具与技术栈：</strong>熟练使用 PowerPoint 与 Excel 完成课件制作、成绩统计与学情看板，使用几何画板、GeoGebra 演示动态几何与函数图像，借助在线白板与直播授课工具开展双师课堂和线上答疑，并能用测评系统完成课前诊断与课后分层作业推送。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>熟悉教育培训行业的班课教学与教研管理流程，能够把考点拆解为可讲授、可练习、可测评的教学单元，并用学情数据持续迭代课程内容。</p><p>沟通与表达能力强，善于与学生建立信任、与家长同步学习进展，也能带动教研组新教师备课磨课，保障校区教学质量稳定。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度优秀教师奖" } },
        { ui: {}, data: { name: "教师教学技能大赛一等奖" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "GitHub", url: "https://example.com/teacher-github" } },
        {
          ui: {},
          data: { name: "教学课件作品集", url: "https://example.com/math-teaching-portfolio" },
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
  ui: structuredClone(getResumeThemeTemplate("violetBiography").item.ui),
};

export default resumeData;
