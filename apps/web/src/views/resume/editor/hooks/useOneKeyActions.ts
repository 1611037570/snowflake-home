import { ref } from "vue";
import eventBus from "@/utils/modules/eventBus";

// 一键操作标识：调整用于修复检查问题，优化用于完成度达标后的综合提升
export type OneKeyFlow = "oneKeyOptimize" | "oneKeyAdjust";

// 优化走独立一次性弹窗，调整继续保留原有说明与助手流程。
export function useOneKeyActions(startFlow: (flow: OneKeyFlow) => void) {
  // 说明弹窗显隐
  const introVisible = ref(false);
  // 优化直接打开独立弹窗，只有一键调整继续展示说明。
  const openOneKeyIntro = (flow: OneKeyFlow) => {
    if (flow === "oneKeyOptimize") {
      eventBus.emit("resume-open-optimize");
      return;
    }
    introVisible.value = true;
  };

  // 用户确认后关闭弹窗并启动对应通用流程
  const confirmOneKeyIntro = () => {
    introVisible.value = false;
    startFlow("oneKeyAdjust");
  };

  return { introVisible, openOneKeyIntro, confirmOneKeyIntro };
}
