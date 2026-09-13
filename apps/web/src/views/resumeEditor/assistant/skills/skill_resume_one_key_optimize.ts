// 一键优化编排技能：按求职方向与身份，补齐缺失经历、综合优化并评分，最终产出结构化优化报告
export const resumeOneKeyOptimize = () => ({
  id: "resume_one_key_optimize",
  name: "一键优化",
  description: `一键优化编排：按求职方向与身份，补齐缺失经历、综合优化内容并评分，输出结构化优化报告。`,
  instructions: `# 执行流程
- 必须先调用 read_resume_data 读取整份简历真实数据，不得只读取或处理局部模块；再根据用户提供的求职方向，调用名称匹配目标行业的 industry_* 行业知识库技能读取岗位族、量化维度与写法要点，未命中专门行业改调 industry_general。
- 调用 resume_writing、resume_optimization 与 resume_data_contract 获取写入、优化及字段规范；需要补齐整段经历时再调用 resume_create，完成后参考 resume_score 做体检与打分。
- 先逐模块审查完整性、重复度、岗位相关性和表达质量，再一次性通过 propose_resume_edits 写入必要的新增、修改、删除与排序操作，禁止只给建议或只做同义改写。

# 增删规则
- 学生应具备实习或校园经历与项目经历，职场人应具备工作经历与项目经历；对应经历模块存在但没有记录时，新增一条带【待补充：字段名】占位的记录，禁止把占位伪装成真实值。
- 基于已有真实事实，可补充缺失的职责、行动、技能场景与成果表达；没有真实数据支撑的数字必须使用【待补充：量化指标】占位，不得编造。
- 删除重复句、空洞自评、无信息量套话、明显模板残留及完全重复的记录；与目标岗位弱相关但包含真实事实的经历不得整段删除，应压缩、降序或突出可迁移能力。
- 不得删除个人身份与联系方式字段，不得删除唯一一条真实工作、项目或教育经历。
- 报告中的 changes 必须准确记录实际执行的新增、修改、删除与排序；没有发生的操作不得声称已完成。

# 报告输出
- 最终回复只输出一份结构化报告，代码块语言标记必须为 resume-report：

\`\`\`resume-report
{
  "totalScore": 82,
  "dimensions": [
    { "name": "内容完整度", "score": 85 },
    { "name": "量化表达", "score": 70 },
    { "name": "结构排版", "score": 88 },
    { "name": "语言表达", "score": 80 },
    { "name": "行业匹配", "score": 75 }
  ],
  "checks": [
    { "level": "error", "message": "缺少证书模块" },
    { "level": "warning", "message": "工作经历第2段缺少量化数据" }
  ],
  "changes": [
    { "module": "工作经历", "summary": "重排至首并补强动词开头" }
  ],
  "todo": ["待补充：公司名称", "待补充：管理资产规模"],
  "highlights": ["解决了动词弱、经历与求职方向不匹配的问题"],
  "suggestions": ["补充待填字段后可再做 JD 对标分析"]
}
\`\`\`

- totalScore 与 dimensions 中每个 score 均为 0-100 的整数；checks 的 level 只能取 error 或 warning。
- dimensions 固定使用以下五项，不可增减或改名：内容完整度、量化表达、结构排版、语言表达、行业匹配。
- 只输出上述一个 resume-report 代码块，代码块外不再输出额外正文。`,
});
