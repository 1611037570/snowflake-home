import { ASSISTANT_WRITING_RULES_TEXT } from "../writingRules";

// 一键优化编排技能：按求职方向与身份，补齐缺失经历、综合优化并评分，最终产出结构化优化报告
export const resumeOneKeyOptimize = () => ({
  id: "resume_one_key_optimize",
  name: "一键优化",
  description: `一键优化编排：按求职方向与身份，补齐缺失经历、综合优化内容并评分，输出结构化优化报告。`,
  instructions: `# 执行
- 读取整份简历，结合用户提供的目标岗位与职业阶段，找出影响筛选判断、岗位匹配和成果表达的主要问题。行业知识库仅在确有帮助时读取，不能把通用词汇当成岗位要求。
- 本技能已包含写入和评分流程，无需再读取 resume_writing、resume_optimization 或 resume_score。需要新增记录、修改未出现的字段或确认格式时读取 resume_data_contract。
- 只对有事实依据且能解决明确问题的内容动笔；同义替换不算优化。必要经历若已有可确认的主体、角色与时间，可补充现有模块记录；缺少核心事实或模块不存在时列入 todo，不写纯占位经历。
- 可压缩或删除重复、空洞表达；真实但弱相关的经历优先精简、后置，不删除唯一的真实工作、项目或教育记录，也不删除身份与联系方式。
- 可选字段为空时默认不补写；数字、职责、技术与成果没有证据时不编造。确需占位时明确标记【待补充：内容】。
- 有必要且安全的改动时用 propose_resume_edits 写入；没有则允许不写。写入后重新读取整份简历，再依据最终内容评分。部分失败只重试未成功操作，未成功的改动不能记入报告。

# 正文写作
${ASSISTANT_WRITING_RULES_TEXT}

# 评分与报告
固定六维顺序：信息完整度、阅读效率、职业契合度、职业成就、发展潜力、职业稳定性。各维只依据适用证据给 0～100 整数分；学生或缺少任职证据时，职业稳定性为 null；其他维度缺少判断基础时也用 null。totalScore 为非 null 分数的平均值并四舍五入，均不可评分时为 null；敏感属性不计分。
最终只输出一个以 \`\`\`resume-report 标记的 Markdown 代码块，块内为合法 JSON，字段如下：
- totalScore：总分或 null。
- dimensions：按上述固定顺序列出六个 { name, score }，名称不得变更。
- checks：优化后仍存在的问题，每项 { level, message }；level 只能是 error 或 warning，message 写明对应维度与简历依据。
- changes：仅记录本轮工具确认成功的改动，每项 { module, summary }；没有成功写入时为空数组。
- todo：仍需用户补充的事实；highlights：有证据的改善；suggestions：尚未解决的问题和具体行动。这三项均为字符串数组，没有内容时返回空数组。
不得把计划、失败操作或纯占位内容写进 changes；分数与结论必须对应最终简历，不能照搬示例。`,
});
