import { xiaoyang } from "../avatar";

export const englishResumeItem: any = {
  data: {
    user: { ui: { archived: false }, data: { position: "Software Engineer", name: "Ethan Chen", birthday: "2000-09", phone: "15888888888", email: "16****70@qq.com", workTime: "2022.08.01", sex: "Male", avatar: xiaoyang } },
    skill: { ui: { collapsed: ["1"], archived: false }, data: { content: "<p><strong>1.</strong> Proficient in TypeScript, Vue and modern front-end engineering workflows.</p><p><strong>2.</strong> Experienced in building data-driven web applications and collaborating across product and engineering teams.</p>" } },
    education: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "University of Manchester", education: "Bachelor's Degree", post: "Computer Science", startTime: "2018.09", endTime: "2022.06", content: "<p>Coursework: Data Structures, Web Development and Software Engineering.</p>", mode: "Full-time" } }] },
    work: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "*** Technology Co., Ltd.", post: "Front-end Engineer", startTime: "2022.08", endTime: "Present", content: "<p>Built reusable front-end modules and delivered web features for enterprise products.</p>" } }] },
    project: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "Analytics Dashboard", post: "Front-end Engineer", startTime: "2024.03", endTime: "2025.01", content: "<p>Developed data visualizations and workflow pages for business operations.</p>" } }] },
  },
  config: { meta: { version: "1.0.0" }, drag: true, dragClass: ".container-drag", fields: [{ key: "user" }, { key: "education" }, { key: "skill" }, { key: "work" }, { key: "project" }] },
  ui: { language: "en", paddingVertical: 24, paddingHorizontal: 24, fontSize: 16, titleFontSize: 22, lineHeight: 1.2, paragraphSpacing: 12, moduleSpacing: 12, themeColor: "#ff4d4f", fontFamily: "text-puhui", themeTemplate: "default", userInfoMode: "text", avatarPosition: "right" },
};

export const englishResumeTemplate = {
  id: "english-resume",
  name: "English Resume",
  description: "An English resume focused on skills, experience and project results.",
  scene: ["english-resume"],
  industry: ["internet"],
  position: ["web-frontend"],
  workExperience: ["0-1"],
  design: ["single-column"],
  tags: ["English", "Project Results"],
  item: englishResumeItem,
};
