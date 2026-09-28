import { xiaozhou } from "../avatar";

const resumeData: any = {
  data: {
    user: { ui: { archived: false }, data: { position: "英国商科硕士申请", name: "宋雨", birthday: "2002-11", phone: "15888888888", email: "16****70@qq.com", workTime: "2025.07.01", sex: "女", avatar: xiaozhou } },
    skill: { ui: { collapsed: ["1"], archived: false }, data: { content: "<p><strong>1、</strong>具备金融分析、商业研究与英文材料撰写能力，熟练使用 Excel 与 PowerPoint。</p><p><strong>2、</strong>雅思 7.0，能够使用英语完成课堂展示、研究报告与跨文化沟通。</p>" } },
    advantage: { ui: { collapsed: ["1"], archived: false }, data: { content: "<p>具备良好的信息搜集、逻辑分析与文字表达能力，能够围绕业务问题整理资料并形成清晰结论。</p><p>对金融市场保持关注，做事细致守时，能够适应多任务协作与阶段性项目安排。</p>" } },
    education: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "上海财经大学", education: "本科", post: "金融学", startTime: "2021.09", endTime: "2025.06", content: "<p>GPA 3.7/4.0，雅思 7.0。</p>", mode: "全日制" } }] },
    work: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "上海****证券有限公司", post: "行业研究实习生", startTime: "2024.07", endTime: "2024.10", content: "<p>参与行业资料整理、公司数据跟踪与研究报告辅助撰写。</p>" } }] },
    project: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "乡村金融调研项目", post: "调研成员", startTime: "2023.07", endTime: "2023.09", content: "<p>完成问卷设计、访谈整理与调研报告撰写。</p>" } }] },
  },
  config: { modules: [{ key: "user" }, { key: "education" }, { key: "skill" }, { key: "advantage" }, { key: "work" }, { key: "project" }] },
  ui: {
    page: { padding: { vertical: 24, horizontal: 24 }, spacing: { paragraph: 12, module: 12 }, footer: "" },
    font: { family: "text-puhui", size: 16, titleSize: 22, lineHeight: 1.2 },
    content: { language: "zh", textAlign: "auto", infoSeparator: "space", linkUnderline: false, dateStyle: "dot", datePosition: "right" },
    theme: { template: "default", color: "#ff4d4f", titleIconMode: "none", userModule: "auto", module: "auto", item: "auto" },
    layout: { template: null, custom: null, leftColumnWidth: 40 },
    user: { infoMode: "text", infoLayout: "flex", avatarPosition: "right", infoPosition: "left" },
  },
};

export default resumeData;
