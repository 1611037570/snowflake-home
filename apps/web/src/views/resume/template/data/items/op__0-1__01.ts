import { xiaozhou } from "../avatar";

export const internshipZeroToOneResumeItem: any = {
  data: {
    user: { ui: { archived: false }, data: { position: "产品运营实习生", name: "许宁", birthday: "2002-08", phone: "15888888888", email: "16****70@qq.com", workTime: "2025.07.01", sex: "女", avatar: xiaozhou } },
    skill: { ui: { collapsed: ["1"], archived: false }, data: { content: "<p><strong>1、</strong>熟练使用 Excel、SQL 与数据看板工具，能够完成活动复盘和用户数据分析。</p><p><strong>2、</strong>具备内容策划、社群运营与跨团队沟通能力，可独立跟进日常运营项目。</p>" } },
    education: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "暨南大学", education: "本科", post: "市场营销", startTime: "2021.09", endTime: "2025.06", content: "<p>主修消费者行为、市场调研与数字营销。</p>", mode: "全日制" } }] },
    work: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "杭州****科技有限公司", post: "产品运营实习生", startTime: "2024.06", endTime: "2024.12", content: "<p>协助完成活动配置、内容发布与效果复盘，推动社群新增用户增长。</p>" } }] },
    project: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "校园新媒体增长项目", post: "项目成员", startTime: "2023.09", endTime: "2024.01", content: "<p>参与选题策划、内容生产与账号数据分析，提升账号互动率。</p>" } }] },
  },
  config: { meta: { version: "1.0.0" }, drag: true, dragClass: ".container-drag", fields: [{ key: "user" }, { key: "education" }, { key: "skill" }, { key: "work" }, { key: "project" }] },
  ui: { language: "zh", paddingVertical: 24, paddingHorizontal: 24, fontSize: 16, titleFontSize: 22, lineHeight: 1.2, paragraphSpacing: 12, moduleSpacing: 12, themeColor: "#ff4d4f", fontFamily: "text-puhui", themeTemplate: "default", userInfoMode: "text", avatarPosition: "right" },
};

export const internshipZeroToOneResumeTemplate = {
  id: "internship-0-1",
  name: "实习简历",
  description: "突出实习职责、运营成果与可迁移技能的实习简历模板",
  scene: ["internship"],
  industry: ["all"],
  position: ["operation"],
  workExperience: ["0-1"],
  design: ["single-column"],
  tags: ["实习经历", "运营成果"],
  item: internshipZeroToOneResumeItem,
};
