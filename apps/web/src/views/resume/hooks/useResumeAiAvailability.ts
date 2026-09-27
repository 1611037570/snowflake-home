import confirm from "@/components/business/confirm";
import { $t } from "@/locales";
import { useAiStore } from "@/stores";

export const useResumeAiAvailability = () => {
  const aiStore = useAiStore();

  // 执行简历 AI 操作前检查小舟模型是否已绑定。
  const ensureAiAvailable = () => {
    const modelId = aiStore.getAgentModelId("xiaoZhou");
    const hasModel = aiStore.modelList.some(
      (model) => model.id === modelId && Boolean(model.provider && model.key),
    );
    if (hasModel) return true;

    void confirm($t("aiUnavailableMessage"), $t("aiUnavailableTitle"), {
      confirmText: $t("aiConfigure"),
      cancelText: $t("aiCancel"),
    })
      .then(() => aiStore.openModelManager("add"))
      .catch(() => undefined);
    return false;
  };

  return { ensureAiAvailable };
};
