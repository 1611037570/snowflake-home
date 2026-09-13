/**
 * useInitMask —— 初始化过渡遮罩
 *
 * 测量完成前盖住空页与分支切换，1 秒后自动取消（仅编辑态展示，只读模式直接隐藏）。
 */
import { onMounted, onUnmounted, ref, type ComputedRef } from "vue";

export const useInitMask = (isEdit: ComputedRef<boolean>) => {
  const showInitMask = ref(true);
  let maskTimer: number | undefined;
  onMounted(() => {
    // 非编辑模式不展示过渡遮罩
    if (!isEdit.value) {
      showInitMask.value = false;
      return;
    }
    maskTimer = window.setTimeout(() => (showInitMask.value = false), 1000);
  });
  onUnmounted(() => window.clearTimeout(maskTimer));

  return { showInitMask };
};
