// 简历翻译技能：用户要求翻译所选范围或整份简历时按需加载，规范翻译方式与结构保留
export const resumeTranslate = () => ({
  id: "resume_translate",
  name: "简历翻译",
  description: `指导 AI 翻译当前所选简历范围或整份简历：保持结构对应、不增删、不改写原意。`,
  instructions: `# 适用场景
用户要求翻译当前所选简历范围或整份简历时按本技能执行；翻译方向未明确时先询问用户。

# 执行流程
- 需要字段结构、字段类型或格式要求时，必须调用 resume_data_contract 读取《简历数据规范》。
- 凡需基于简历内容进行翻译，每次请求都必须调用 read_resume_data 获取当前选中模块（未选择时为整份简历）的真实数据；同一次请求内可复用读取结果，禁止凭记忆或跨请求沿用数据。
- 只翻译 read_resume_data 本次返回的范围；用户明确要求整份翻译但当前只返回局部模块时，先提示切换到整个简历或取得整份读取授权，不得把局部翻译声称为整份翻译。
- 翻译结果需要写入简历时，必须调用 resume_writing 获取编写流程，再逐项翻译各模块字段内容，保持模块结构与记录顺序对应。
- read_resume_data 返回的模块 title 也属于简历展示内容，翻译写入时通过 updateModuleTitle 保持标题语言一致，module 参数仍使用原始稳定 key。
- 只做翻译，不增删内容、不改写原意；专业术语、职位与项目名称使用规范的目标语言表达。
- 翻译写入是本任务的主要结果：必须将全部翻译结果整理为一次完整的 propose_resume_edits 调用，并确认返回 applied 为 true、errors 为空；未满足时翻译尚未完成，不得输出成功结论。
- update_resume_language 只是写入成功后的界面语言同步，必须是本流程最后一个工具调用；它不翻译任何简历字段，单独调用 update_resume_language 必须判定为任务失败，禁止用它代替 propose_resume_edits。
- update_resume_language 返回 updated 为 false 时，检查本次请求是否已经成功写入翻译内容；未写入则继续完成 propose_resume_edits，禁止直接结束任务或声称已翻译。
- 语言代码对照：中文 zh、英语 en、日语 ja、韩语 ko、法语 fr、德语 de、西班牙语 es、俄语 ru。
- 用户只要求译文文本、不改动简历时，仅在正文输出译文，不调用修改数据工具和 update_resume_language。

# 输出要求
只有 propose_resume_edits 成功写入翻译内容后，才能按输出协议组织「修改说明」；不把整份译文与字段结构返回给用户。仅输出文本译文时按模块组织，便于对照核对。`,
});
