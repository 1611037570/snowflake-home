import { configureInterviewModelProvider } from "@snowflake/interview-agent/host";
import { useAiStore } from "@/stores";
import { getXiaoYangLLM } from ".";

// 面试官小羊独立接线，不共用简历助手小舟的绑定。
export const registerInterviewAgentHost = () => {
  configureInterviewModelProvider({
    getModel: getXiaoYangLLM, // 每次请求创建面试官小羊自己的模型实例。
    hasModel: () => {
      const aiStore = useAiStore();
      const modelId = aiStore.getAgentModelId("xiaoYang");
      const model = aiStore.modelList.find((item) => item.id === modelId);
      return Boolean(model?.provider && model.key && model.url && model.model);
    }, // 只检查面试官角色，不回退到其他智能体。
  });
};
