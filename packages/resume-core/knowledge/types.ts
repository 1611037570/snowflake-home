export interface ResumeKnowledge {
  id: string; // 行业资料稳定标识。
  role: "reference"; // 只读资料，不承担智能体任务。
  name: string; // 资料展示名称。
  description: string; // 资料用途摘要。
  instructions: string; // 行业事实与分析参考正文。
}

export interface ResumeKnowledgeRegistration extends Omit<ResumeKnowledge, "instructions"> {
  load: () => Promise<ResumeKnowledge>; // 按需读取资料正文，不引入业务智能体。
}
