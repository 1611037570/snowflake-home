// 技能：简历编写
// 描述：指导 AI 如何通过 propose_resume_edits 把用户诉求转成简历写操作
import { ASSISTANT_WRITING_RULES_TEXT } from "../writingRules";
export const resumeWriting = () => ({
  id: "resume_writing",
  name: "简历编写",
  description: `指导 AI 通过 propose_resume_edits 编写、修改、重命名、新增、删除或排序简历内容。`,
  instructions: `# 写入流程
- 先读取本次可访问的简历范围，明确用户要改的模块与记录；目标不清且会导致误改时再询问。只修改用户要求的内容，删除或排序前确认具体对象。
- 字段、类型或格式无法从读取结果确定，以及新增记录、可添加字段或模块标题变更时，读取 resume_data_contract。空的可选字段默认不补写，模块标题只在用户要求或翻译任务需要时修改。
- 写入只通过 propose_resume_edits 提交。富文本使用 HTML；模块使用稳定 key，记录下标按操作后的当前顺序计算。多项相关改动可合为一次提交。
- 工具返回部分失败时，依据 operationIndex 和最新简历数据只重试未成功操作；不要重复已成功的新增、删除或排序。
- 不编造经历或数值；必要事实缺失时可用类型合法的【待补充：内容】占位并提醒用户，日期与枚举不填占位。一键调整生成临时内容时遵循其专用技能。

# 正文写作
${ASSISTANT_WRITING_RULES_TEXT}

# 结果说明
只概括实际写入的改动与待补充事实，不整段复述正文；删除、排序或部分失败后以最新数据核对结果。`,
});
