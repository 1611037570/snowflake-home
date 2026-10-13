import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

const resumeData: any = {
  data: {
    user: { ui: { archived: false }, data: { position: "Software Engineer", name: "Ethan Chen", birthday: "2003.06", phone: "15888888888", email: "16****70@qq.com", workTime: "2025.07", sex: "Male", avatar: xiaoyang } },
    skill: { ui: { collapsed: ["1"], archived: false }, data: { content: "<p><strong>1.</strong> Proficient in TypeScript, Vue and modern front-end engineering workflows.</p><p><strong>2.</strong> Experienced in building data-driven web applications and collaborating across product and engineering teams.</p>" } },
    advantage: { ui: { collapsed: ["1"], archived: false }, data: { content: "<p>Strong problem-solving and communication skills, with a practical approach to understanding requirements and delivering maintainable solutions.</p><p>Adaptable and detail-oriented, with a collaborative mindset and a commitment to continuous learning.</p>" } },
    education: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "University of Manchester", education: "Bachelor's Degree", post: "Computer Science", startTime: "2022.09", endTime: "2025.06", content: "<p>Coursework: Data Structures, Web Development and Software Engineering.</p>", mode: "Full-time" } }] },
    work: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "*** Technology Co., Ltd.", post: "Front-end Engineer", startTime: "2025.07", endTime: "Present", content: "<p>Built reusable front-end modules and delivered web features for enterprise products, shipping over 30 components and improving page load performance by around 25%.</p>" } }] },
    project: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "Analytics Dashboard", post: "Front-end Engineer", startTime: "2025.08", endTime: "2026.02", content: "<p>Developed data visualizations and workflow pages for business operations, covering 12 dashboard views used by over 500 internal users.</p>" } }] },
  },
  config: { modules: [{ key: "user" }, { key: "education" }, { key: "skill" }, { key: "advantage" }, { key: "work" }, { key: "project" }] },
  // 界面配置沿用主题预设：与模板页该主题的样式卡片共用同一份配置，保证布局与配色一致。
  ui: {
    ...structuredClone(getResumeThemeTemplate("centeredClean").item.ui),
    content: { language: "en" }, // 英文范本保留英文正文语言配置
  },
};

export default resumeData;
