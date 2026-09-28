import { xiaoyang } from "../avatar";

const resumeData: any = {
  data: {
    user: { ui: { archived: false }, data: { position: "Software Engineer", name: "Ethan Chen", birthday: "2000-09", phone: "15888888888", email: "16****70@qq.com", workTime: "2022.08.01", sex: "Male", avatar: xiaoyang } },
    skill: { ui: { collapsed: ["1"], archived: false }, data: { content: "<p><strong>1.</strong> Proficient in TypeScript, Vue and modern front-end engineering workflows.</p><p><strong>2.</strong> Experienced in building data-driven web applications and collaborating across product and engineering teams.</p>" } },
    advantage: { ui: { collapsed: ["1"], archived: false }, data: { content: "<p>Strong problem-solving and communication skills, with a practical approach to understanding requirements and delivering maintainable solutions.</p><p>Adaptable and detail-oriented, with a collaborative mindset and a commitment to continuous learning.</p>" } },
    education: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "University of Manchester", education: "Bachelor's Degree", post: "Computer Science", startTime: "2018.09", endTime: "2022.06", content: "<p>Coursework: Data Structures, Web Development and Software Engineering.</p>", mode: "Full-time" } }] },
    work: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "*** Technology Co., Ltd.", post: "Front-end Engineer", startTime: "2022.08", endTime: "Present", content: "<p>Built reusable front-end modules and delivered web features for enterprise products.</p>" } }] },
    project: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "Analytics Dashboard", post: "Front-end Engineer", startTime: "2024.03", endTime: "2025.01", content: "<p>Developed data visualizations and workflow pages for business operations.</p>" } }] },
  },
  config: { meta: { version: "1.0.0" }, drag: true, dragClass: ".container-drag", fields: [{ key: "user" }, { key: "education" }, { key: "skill" }, { key: "advantage" }, { key: "work" }, { key: "project" }] },
  ui: {
    page: { padding: { vertical: 24, horizontal: 24 }, spacing: { paragraph: 12, module: 12 }, footer: "" },
    font: { family: "text-puhui", size: 16, titleSize: 22, lineHeight: 1.2 },
    content: { language: "en", textAlign: "auto", infoSeparator: "space", linkUnderline: false, dateStyle: "dot", datePosition: "right" },
    theme: { template: "default", color: "#ff4d4f", titleIconMode: "none", userModule: "auto", module: "auto", item: "auto" },
    layout: { template: null, custom: null, leftColumnWidth: 40 },
    user: { infoMode: "text", infoLayout: "flex", avatarPosition: "right", infoPosition: "left" },
  },
};

export default resumeData;
