// 技能：简历编写
// 描述：指导 AI 如何通过 propose_resume_edits 把用户诉求转成简历写操作
export const resumeWriting = () => ({
  id: "resume_writing",
  name: "简历编写",
  description: `本技能用于指导 AI 如何通过 propose_resume_edits 编写、修改或新增简历内容。当用户要求写简历、改经历、新增工作/项目/教育等记录时必须加载本技能。字段结构与格式以《简历数据规范》为准。`,
  instructions: `# 适用场景
写简历、改简历、把用户描述转成经历内容、新增数组型模块记录（如工作、项目、教育）时使用本技能。

# 前置准备
1. 先调用 read_resume_data 读取目标模块真实数据，确认模块、已有记录与字段。
2. 字段名、类型、必填与格式一律以《简历数据规范》为准，需要时调用 load_resume_data_contract 获取全文，不要凭记忆写。
3. 涉及内容质量提升时，配合 load_resume_optimization 获取写作方法论。

# 写操作（propose_resume_edits）
只通过 operations 提交写操作，不直接在最终结果中返回简历数据。

- 修改已有字段：
  - 对象型模块：{ op: "update", module, field, value }
  - 数组型模块：{ op: "update", module, index, field, value }，index 为记录下标，从 0 开始
- 新增记录（仅数组型模块）：{ op: "add", module, record }
  record 填写该模块 data 记录对应的字段；新增记录会同步出现在表单与预览中，内容直接写入，可撤销或手动修改。

# 操作要求
1. 每次写操作都要基于 read_resume_data 的真实结果定位：module 必须存在；update 的 index 和 field 必须对应已有记录与字段。
2. 一次调用可包含多条 operations，系统会合并为一次写入，避免分多次零散提交。
3. 若 propose_resume_edits 返回 errors，先按错误逐条修正后重新提交，不得忽略错误或直接结束任务。
4. 用户未提供的事实不得编造；信息不足时用占位内容并在正文中提示用户补充核对。
5. 操作说明直接写入 Markdown 正文，用二级标题「修改说明」组织，并提示内容已写入、可在编辑器中撤销或修改。`,
});
