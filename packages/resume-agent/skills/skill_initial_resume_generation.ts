import { ASSISTANT_WRITING_RULES_TEXT } from "../writingRules";

// AI 生成简历入口技能：把用户分模块提供的事实整理为可预览的完整简历草稿。
export const initialResumeGeneration = () => ({
  id: "resume_initial_generation",
  name: "AI 生成简历",
  description: "根据新建简历入口收集的个人、教育、技能、工作与项目资料生成简历草稿。",
  instructions: `# 任务
- 调用 \`read_resume_generation_input\` 读取本次入口收集的资料，再自行判断如何组织简历内容。
- 只处理用户填写的模块；跳过的模块不生成，也不为了完整度补造事实。
- 需要确认字段结构时调用 \`resume_data_contract\`，不要自行创建字段。
- 完成后调用 \`submit_generated_resume\` 提交一份完整草稿，顶层按稳定模块 key 组织，每个模块使用 \`{ data: ... }\`。

# 写作
- 在不改变事实的前提下提炼职责、行动与成果，保持用户主要使用的语言。
- 缺少学校、公司、项目、日期、数字、职级、技能或成果时省略对应字段，不使用占位文本。
- 月份使用 YYYY.MM，持续中的结束时间使用 至今；富文本字段使用 HTML。

${ASSISTANT_WRITING_RULES_TEXT}`,
});
