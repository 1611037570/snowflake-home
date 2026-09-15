// 技能：简历编写
// 描述：指导 AI 如何通过 propose_resume_edits 把用户诉求转成简历写操作
export const resumeWriting = () => ({
  id: "resume_writing",
  name: "简历编写",
  description: `指导 AI 通过 propose_resume_edits 编写、修改、重命名、新增、删除或排序简历内容。`,
  instructions: `# 适用场景
写简历、改简历、把用户描述转成经历内容、新增/删除/排序数组型模块记录（如工作、项目、教育）时使用本技能。

# 写入前
1. 目标模块不明确时先向用户确认，禁止凭方向猜测后直接写入。
2. 普通请求需要删除或调整顺序时，提交前必须基于真实数据准确定位目标模块与记录，并在写入完成后的修改说明中说明实际作用对象；用户主动发起一键优化，且局部模式已取得整份简历读取授权时，按其报告规则说明。
3. 先调用 read_resume_data 读取当前选中模块真实数据（未选择模块时读取整份简历），写操作只能作用于读取返回范围内的模块。
4. 字段名、类型、必填与格式一律以《简历数据规范》为准，需要时调用 resume_data_contract 获取全文，不要凭记忆写。
5. 涉及内容质量提升时，配合调用 resume_optimization 获取写作方法论。

# 写操作（propose_resume_edits）
只通过 operations 提交写操作，调用后立即写入简历数据（用户可撤回），不要返回简历数据。

- 修改字段：
  - 模块级字段：{ op: "updateModule", module, field, value }
  - 模块级可添加字段即使未出现在当前 data 中，也可按《简历数据规范》通过 updateModule 写入，写入后会激活并展示该字段
  - 模块展示标题：{ op: "updateModuleTitle", module, title }，module 始终使用 read_resume_data 返回的稳定 key，禁止把展示标题当作 key
  - 记录字段：{ op: "updateRecord", module, index, field, value }，index 为记录下标，从 0 开始
- 新增记录（仅数组型模块）：{ op: "addRecord", module, record }
  record 填写该模块 data 记录对应的字段；用户未提供的字段用【待补充：xxx】占位或留空待补。
- 删除记录：{ op: "deleteRecord", module, index }
- 调整顺序：{ op: "moveRecord", module, from, to }

# 操作要求
1. 每次写操作都基于 read_resume_data 返回的真实数据定位：module 必须在返回范围内；update/delete/move 的 index、from、to 必须对应已有记录。
2. 一次调用可包含多条 operations，系统会合并为一次写入，避免分多次零散提交。
3. 若 propose_resume_edits 返回 errors 或部分操作失败，先依据 changed、failed 与 errors 判断实际结果，再调用 read_resume_data 读取最新数据；只重新构造未成功的操作并按最新记录下标提交，禁止重放已成功操作或沿用删除、排序前的旧下标。
4. 起草新增内容时优先使用真实事实；缺失部分用【待补充：xxx】占位并在正文提醒补充核对，占位不算虚构，禁止把占位伪装成真实具体值。
5. 除非用户明确要求修改模块标题，或正在翻译用户自定义标题，否则不得主动调用 updateModuleTitle。

# 输出要求
- 上层任务技能声明专用输出格式时以其为准；否则写操作完成后不整段复述写入正文，用 Markdown 表格按「模块 / 一句话改动要点」概括改了什么。
- 修改说明只能记录工具确认成功的操作；需要核对最终内容、发生过删除或排序、或出现过部分失败时，先重新读取数据再总结。
- 缺失的【待补充】字段单独列出提醒补充。
`,
});
