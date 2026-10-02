import { xiaoyang } from "../avatar";

const resumeData: any = {
  data: {
    user: { ui: { archived: false }, data: { position: "计算机科学与技术硕士申请", name: "周航", birthday: "2002.03", phone: "15888888888", email: "16****70@qq.com", workTime: "2025.07", sex: "男", avatar: xiaoyang } },
    skill: { ui: { collapsed: ["1"], archived: false }, data: { content: "<p><strong>1、</strong>掌握 Python、机器学习基础与数据处理方法，具备科研复现和实验分析能力。</p><p><strong>2、</strong>参与算法竞赛与课题研究，能够独立阅读论文并完成技术报告撰写。</p>" } },
    advantage: { ui: { collapsed: ["1"], archived: false }, data: { content: "<p>具备扎实的计算机专业基础与持续学习能力，能够快速理解研究问题并将其拆解为可执行的实验任务。</p><p>做事认真细致，善于查阅论文、整理数据并清晰呈现研究过程与结论。</p>" } },
    education: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "北京邮电大学", education: "本科", post: "计算机科学与技术", startTime: "2021.09", endTime: "2025.06", content: "<p>GPA 3.8/4.0，专业排名前 10%。</p>", mode: "全日制" } }] },
    work: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "北京****科技有限公司", post: "算法研究实习生", startTime: "2024.07", endTime: "2024.10", content: "<p>协助整理训练数据与实验记录，复现基础模型并参与结果分析，支持团队完成阶段性技术报告。</p>" } }] },
    project: { ui: { collapsed: ["1"], archived: false }, list: [{ ui: {}, data: { name: "图神经网络课程研究", post: "课题成员", startTime: "2024.03", endTime: "2024.12", content: "<p>负责数据预处理、模型复现与实验结果分析，完成课程研究报告。</p>" } }] },
  },
  config: { modules: [{ key: "user" }, { key: "education" }, { key: "skill" }, { key: "advantage" }, { key: "work" }, { key: "project" }] },
  ui: {
    page: { padding: { vertical: 24, horizontal: 24 }, spacing: { paragraph: 12, module: 12 }, footer: "" },
    font: { family: "text-puhui", size: 16, titleSize: 22, lineHeight: 1.2 },
    content: { language: "zh", textAlign: "auto", infoSeparator: "space", linkUnderline: false, dateStyle: "dot", datePosition: "right" },
    theme: {
      template: "academic", // 升学范本使用的主题编号
      color: "#0F766E", // 主题强调色
      titleIconMode: "none", // 标题图标显示方式
    },
    layout: { template: null, custom: null, leftColumnWidth: 40 },
    user: { infoMode: "text", infoLayout: "flex", avatarPosition: "right", infoPosition: "left" },
  },
};

export default resumeData;
