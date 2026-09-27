import { xiaoyang } from "../avatar";

const resumeData: any = {
  data: {
    user: { ui: { archived: false }, data: { position: "软件工程师（校招）", name: "陈明", birthday: "2003-05", phone: "15888888888", email: "16****70@qq.com", workTime: "2025.07.01", sex: "男", avatar: xiaoyang } },
    skill: { ui: { collapsed: ["1"], archived: false }, data: { content: "<p><strong>1、</strong>熟悉 JavaScript、TypeScript 与 Vue3，能够完成后台管理系统与移动端页面开发。</p><p><strong>2、</strong>掌握 Git 协作、接口联调与基础数据结构算法，具备良好的工程实践习惯。</p>" } },
    advantage: { ui: { collapsed: ["1"], archived: false }, data: { content: "<p>具备良好的逻辑思维与代码规范意识，能够主动分析问题并通过查阅资料和动手实践持续提升。</p><p>重视团队沟通与任务协作，能够认真跟进开发、联调和问题修复等工作。</p>" } },
    education: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "杭州电子科技大学", education: "本科", post: "软件工程", startTime: "2021.09", endTime: "2025.06", content: "<p>主修软件工程、数据库原理与计算机网络。</p>", mode: "全日制" } }] },
    work: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "杭州****科技有限公司", post: "前端开发实习生", startTime: "2024.07", endTime: "2024.12", content: "<p>参与后台管理系统页面开发与维护，协助完成接口联调、功能自测和缺陷修复。</p>" } }] },
    project: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "校园智能课表小程序", post: "前端开发", startTime: "2024.03", endTime: "2024.06", content: "<p>负责课程查询、提醒与课表编辑功能，实现小程序端页面与接口联调。</p>" } }] },
  },
  config: { meta: { version: "1.0.0" }, drag: true, dragClass: ".container-drag", fields: [{ key: "user" }, { key: "education" }, { key: "skill" }, { key: "advantage" }, { key: "work" }, { key: "project" }] },
  ui: { language: "zh", paddingVertical: 24, paddingHorizontal: 24, fontSize: 16, titleFontSize: 22, lineHeight: 1.2, paragraphSpacing: 12, moduleSpacing: 12, themeColor: "#ff4d4f", fontFamily: "text-puhui", themeTemplate: "default", userInfoMode: "text", avatarPosition: "right" },
};

export default resumeData;
