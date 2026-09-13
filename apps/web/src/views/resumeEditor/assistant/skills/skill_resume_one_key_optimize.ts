// 一键优化编排技能：按求职方向与身份，补齐缺失经历、综合优化并评分，最终产出结构化优化报告
export const resumeOneKeyOptimize = () => ({
  id: "resume_one_key_optimize",
  name: "一键优化",
  description: `一键优化编排：按求职方向与身份，补齐缺失经历、综合优化内容并评分，输出结构化优化报告。`,
  instructions: `# 执行流程
- 先调用 read_resume_data 读取整份简历真实数据；根据用户提供的求职方向，调用名称匹配目标行业的 industry_* 行业知识库技能读取岗位族、量化维度与写法要点，未命中专门行业改调 industry_general。
- 按身份判断经历完备性：学生需具备实习/校园经历与项目经历，职场人需具备工作经历与项目经历；缺失时按 resume_writing 与 resume_create 的规范起草带【待补充】占位的经历并写入，禁止把占位伪装成真实值。
- 对现有真实内容按行业要点综合优化，优化不改变事实、不臆造数据。
- 补齐与优化完成后，以资深 HR 视角做体检与打分（参考 resume_score）。

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