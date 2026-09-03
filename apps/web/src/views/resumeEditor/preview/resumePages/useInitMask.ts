/**
 * useInitMask —— 初始化过渡遮罩
 *
 * 测量完成前盖住空页与分支切换，1 秒后自动取消。
 */
import { onMounted, onUnmounted, ref } from "vue";

export const useInitMask = () => {
  const showInitMask = ref(true);
  let maskTimer: number | undefined;
  onMounted(() => {
    maskTimer = window.setTimeout(() => (showInitMask.value = false), 1000);
  });
  onUnmounted(() => window.clearTimeout(maskTimer));

  return { showInitMask };
};
