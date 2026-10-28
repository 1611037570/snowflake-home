import type { ResumeAgentTaskProfile } from "../runtime/taskTypes";
import { validateResumeReportChanges } from "../reports/resumeReport";

// 一键优化只由按钮入口装配，不注册为通用对话技能。
export const ONE_KEY_OPTIMIZE_TASK: ResumeAgentTaskProfile = {
  id: "oneKeyOptimize", // 按钮任务稳定标识。
  preferredCapabilityId: "resume_optimization", // 优先加载通用简历优化方法。
  allowModuleTitleEdit: false, // 岗位优化只修改实际简历内容。
  objective: "结合入口提供的求职岗位优化整份简历并输出评分报告", // 按钮已经明确的任务目标。
  // 检查后确认没有安全改动也是正常结果，因此不强制本轮产生写入。
  requiredEffects: [],
  // 用户可核对的完成条件。
  successCondition: "当前简历已完成有事实依据的岗位优化并生成评分报告；没有安全改动时说明无需修改的原因",
  completionPolicy: {
    requiredEvidence: ["read"], // 必须基于真实读取的简历给出结论。
    readAfterEvidence: ["resume_change"], // 只有真的写入后才要求基于写入后的数据重新读取。
  },
  validateFinal: validateResumeReportChanges, // 报告改动条目必须与实际写入证据一致。
  instructions: `# 任务范围
- 结合入口提供的目标岗位优化整份简历，行业知识库仅在确有帮助时读取，不能把通用词汇当成岗位要求。
- 求职岗位已由入口提供，职业阶段根据简历判断；不再追问已明确的岗位或身份，缺少关键事实时列入 todo。
- 必要经历若已有可确认的主体、角色与时间，可补充现有模块记录；缺少主体或模块不存在时列入 todo，不写纯占位经历。候选内容列入 todo 供用户按实际情况确认。
- 可压缩或删除重复、空洞表达；真实但弱相关的经历优先精简、后置，不删除唯一的真实工作、项目或教育记录，也不删除身份与联系方式。
- 姓名、公司、项目名称、任职时间、学校、学历和证书没有资料时不创建。职责、技术、成果及量化候选按共用规则补全，不得覆盖与用户资料冲突的事实；未核实内容不能写成用户已确认的成果。
- 保持模块展示标题不变；岗位匹配应体现在实际经历、技能和项目内容中，不把岗位说明写进模块标题。
- 确无可操作内容时在报告中说明。评分只依据最终简历中已确认的事实，带 XX 占位的候选不作为已达成成果计分，未成功的改动不能记入报告。

# 评分与报告
固定六维顺序：信息完整度、阅读效率、职业契合度、职业成就、发展潜力、职业稳定性。各维只依据适用证据给 0～100 整数分；学生或缺少任职证据时，职业稳定性为 null；其他维度缺少判断基础时也用 null。totalScore 为非 null 分数的平均值并四舍五入，均不可评分时为 null；敏感属性不计分。
最终只输出一个以 \`\`\`resume-report 标记的 Markdown 代码块，块内为合法 JSON；没有安全改动时 changes 为空，并在 suggestions 中说明原因。字段如下：
- totalScore：总分或 null。
- dimensions：按上述固定顺序列出六个 { name, score }，名称不得变更。
- checks：优化后仍存在的问题，每项 { level, message }；level 只能是 error 或 warning，message 写明对应维度与简历依据。
- changes：本轮真实写入的改动，按模块汇总，每个模块只列一条 { module, summary }；summary 概括该模块的改动范围，不逐条罗列字段；未成功写入时为空数组，跳过失败与复用结果。
- suggestions：尚未解决的问题与具体行动，字符串数组，没有内容时返回空数组。不需要输出 todo 与 highlights。
输出前核对 JSON 可解析、六维顺序和名称固定、changes 覆盖了实际写入的全部模块且没有多列；不得把计划、失败操作或纯占位内容写进 changes。分数与结论必须对应最终简历，不能照搬示例。`, // 该按钮任务独有的执行、评分与输出规则。
};
