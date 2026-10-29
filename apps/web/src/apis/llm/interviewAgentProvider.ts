import { configureInterviewModelProvider } from "@snowflake/interview-agent/host";
import { useAiStore } from "@/stores";
import { getInterviewerLLM } from ".";

// 面试独立接线，修改面试官模型不会改变简历助手的绑定。
export const registerInterviewAgentHost = () => {
  configureInterviewModelProvider({
    getModel: getInterviewerLLM, // 每次请求创建面试官自己的模型实例。
    hasModel: () => {
      const aiStore = useAiStore();
      const modelId = aiStore.getAgentModelId("interviewer");
      const model = aiStore.modelList.find((item) => item.id === modelId);
      return Boolean(model?.provider && model.key && model.url && model.model);
    }, // 只检查面试官角色，不回退到其他智能体。
  });
};
