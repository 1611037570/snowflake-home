import { xiaozhou } from "../avatar";

export const studyAbroadResumeItem: any = {
  data: {
    user: { ui: { archived: false }, data: { position: "英国商科硕士申请", name: "宋雨", birthday: "2002-11", phone: "137****9054", email: "songyu@example.com", workTime: "2025.07.01", sex: "女", avatar: xiaozhou } },
    account: { ui: { collapsed: ["1"], archived: false }, list: [] },
    skill: { ui: { collapsed: ["1"], archived: false }, data: { content: "<p><strong>1、</strong>具备金融分析、商业研究与英文材料撰写能力，熟练使用 Excel 与 PowerPoint。</p><p><strong>2、</strong>雅思 7.0，能够使用英语完成课堂展示、研究报告与跨文化沟通。</p>" } },
    education: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "***大学", education: "本科", post: "金融学", startTime: "2021.09", endTime: "2025.06", content: "<p>GPA 3.7/4.0，雅思 7.0。</p>", mode: "全日制" } }] },
    work: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "上海****证券有限公司", post: "行业研究实习生", startTime: "2024.07", endTime: "2024.10", content: "<p>参与行业资料整理、公司数据跟踪与研究报告辅助撰写。</p>" } }] },
    project: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "乡村金融调研项目", post: "调研成员", startTime: "2023.07", endTime: "2023.09", content: "<p>完成问卷设计、访谈整理与调研报告撰写。</p>" } }] },
    video: { ui: { collapsed: [], hidden: false, archived: false }, list: [] },
    image: { ui: { collapsed: [], hidden: false, archived: false }, list: [] },
  },
  config: { meta: { version: "1.0.0" }, drag: true, dragClass: ".container-drag", fields: [{ key: "user" }, { key: "account" }, { key: "education" }, { key: "skill" }, { key: "work" }, { key: "project" }, { key: "video" }] },
  ui: { language: "zh", paddingVertical: 24, paddingHorizontal: 24, fontSize: 16, titleFontSize: 22, lineHeight: 1.2, paragraphSpacing: 12, moduleSpacing: 12, themeColor: "#ff4d4f", fontFamily: "text-puhui", themeTemplate: "default", userInfoMode: "text", avatarPosition: "right" },
};

export const studyAbroadResumeTemplate = {
  id: "study-abroad",
  name: "留学简历",
  description: "突出学术成绩、语言能力与实践经历的留学申请简历模板",
  scene: ["study-abroad"],
  industry: ["all"],
  position: ["all"],
  workExperience: ["student"],
  design: ["single-column"],
  tags: ["留学申请", "语言能力"],
  item: studyAbroadResumeItem,
};
