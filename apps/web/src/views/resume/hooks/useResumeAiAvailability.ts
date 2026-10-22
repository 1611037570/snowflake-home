import confirm from "@/components/business/confirm";
import { $t } from "@/locales";
import { useAiStore } from "@/stores";
import { hasResumeAiModel } from "@snowflake/resume-agent";

export const useResumeAiAvailability = () => {
  const aiStore = useAiStore();

  /**
   * 执行简历 AI 操作前检查小舟模型是否已完整配置。
   * @param onConfigure 点击「去配置」后的动作，未传时打开编辑器内的模型弹窗；
   *   列表页等没有该弹窗的位置需自行传入关闭当前弹窗并跳转配置页的逻辑。
   */
  const ensureAiAvailable = (onConfigure?: () => void) => {
    if (hasResumeAiModel("xiaoZhou")) return true;

    void confirm($t("aiUnavailableMessage"), $t("aiUnavailableTitle"), {
      confirmText: $t("aiConfigure"),
      cancelText: $t("aiCancel"),
    })
      .then(() => {
        if (onConfigure) onConfigure();
        else aiStore.openModelManager("add");
      })
      // 取消配置时不改变当前页面状态。
      .catch(() => undefined);
    return false;
  };

  return { ensureAiAvailable };
};
