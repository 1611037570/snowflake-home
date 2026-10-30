import type { LLM } from "@snowflake/ai";

export interface InterviewModelProvider {
  getModel: () => LLM | undefined; // 独立解析面试官绑定的模型实例。
  hasModel: () => boolean; // 判断面试官是否已配置完整模型。
}

let modelProvider: InterviewModelProvider | undefined;

// 面试使用自己的宿主接线，不读取简历智能体的模型角色或默认值。
export const configureInterviewModelProvider = (provider: InterviewModelProvider) => { modelProvider = provider; };
export const hasInterviewModel = () => modelProvider?.hasModel() ?? false;
export const getInterviewModel = () => {
  const model = modelProvider?.getModel();
  if (!model?.apiKey || !model.url || !model.model) throw new Error("请先为面试官小羊配置模型");
  return model;
};
