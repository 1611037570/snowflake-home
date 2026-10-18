import { ref } from "vue";

// 一键操作标识：调整用于修复检查问题，优化用于完成度达标后的综合提升
export type OneKeyFlow = "oneKeyOptimize" | "oneKeyAdjust";

// 一键入口共用逻辑：统一打开功能说明弹窗，确认后才启动对应通用流程
export function useOneKeyActions(startFlow: (flow: OneKeyFlow) => void) {
  // 说明弹窗显隐
  const introVisible = ref(false);
  // 当前待确认的一键操作
  const introFlow = ref<OneKeyFlow>("oneKeyOptimize");

  // 打开指定一键操作的功能说明
  const openOneKeyIntro = (flow: OneKeyFlow) => {
    introFlow.value = flow;
    introVisible.value = true;
  };

  // 用户确认后关闭弹窗并启动对应通用流程
  const confirmOneKeyIntro = () => {
    introVisible.value = false;
    startFlow(introFlow.value);
  };

  return { introVisible, introFlow, openOneKeyIntro, confirmOneKeyIntro };
}
