import { xiaoyang } from "../avatar";

export const furtherEducationResumeItem: any = {
  data: {
    user: { ui: { archived: false }, data: { position: "计算机科学与技术硕士申请", name: "周航", birthday: "2002-03", phone: "139****4681", email: "zhouhang@example.com", workTime: "2025.07.01", sex: "男", avatar: xiaoyang } },
    account: { ui: { collapsed: ["1"], archived: false }, list: [] },
    skill: { ui: { collapsed: ["1"], archived: false }, data: { content: "<p><strong>1、</strong>掌握 Python、机器学习基础与数据处理方法，具备科研复现和实验分析能力。</p><p><strong>2、</strong>参与算法竞赛与课题研究，能够独立阅读论文并完成技术报告撰写。</p>" } },
    education: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "***大学", education: "本科", post: "计算机科学与技术", startTime: "2021.09", endTime: "2025.06", content: "<p>GPA 3.8/4.0，专业排名前 10%。</p>", mode: "全日制" } }] },
    work: { ui: { collapsed: ["1"], archived: false }, list: [] },
    project: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "图神经网络课程研究", post: "课题成员", startTime: "2024.03", endTime: "2024.12", content: "<p>负责数据预处理、模型复现与实验结果分析，完成课程研究报告。</p>" } }] },
    video: { ui: { collapsed: [], hidden: false, archived: false }, list: [] },
    image: { ui: { collapsed: [], hidden: false, archived: false }, list: [] },
  },
  config: { meta: { version: "1.0.0" }, drag: true, dragClass: ".container-drag", fields: [{ key: "user" }, { key: "account" }, { key: "education" }, { key: "skill" }, { key: "work" }, { key: "project" }, { key: "video" }] },
  ui: { language: "zh", paddingVertical: 24, paddingHorizontal: 24, fontSize: 16, titleFontSize: 22, lineHeight: 1.2, paragraphSpacing: 12, moduleSpacing: 12, themeColor: "#ff4d4f", fontFamily: "text-puhui", themeTemplate: "default", userInfoMode: "text", avatarPosition: "right" },
};

export const furtherEducationResumeTemplate = {
  id: "further-education",
  name: "升学简历",
  description: "突出成绩、科研课题与学术能力的国内升学简历模板",
  scene: ["further-education"],
  industry: ["all"],
  position: ["all"],
  workExperience: ["student"],
  design: ["single-column"],
  tags: ["国内升学", "科研经历"],
  item: furtherEducationResumeItem,
};
