import { createDefaultAssistantPrompt } from "@snowflake/resume-agent";

// 任务契约负责声明必需业务效果，默认提示只保留工具与事实边界。
const ASSISTANT_ROUTING_INSTRUCTIONS = `# 执行边界
- 需要当前简历内容时调用 read_resume_data 获取最新数据；同一状态可复用读取结果，数据变化后再读。
- 「[数据已脱敏]」保持原样，含该标记的字段不写入、不推测；其他字段可正常处理。
- 用户要求当前简历发生变化时调用 propose_resume_edits；字段结构不明确时通过参考知识工具读取《简历数据规范》。失败后依据最新数据只重试未成功操作。
- 不编造经历、数字、职级或成果；当前任务配置明确允许临时内容时，按其要求标出待确认项。
- 所需技能未进入本轮上下文时，可按工具说明自行读取。`;

export const defaultPrompt = () => createDefaultAssistantPrompt(ASSISTANT_ROUTING_INSTRUCTIONS);
