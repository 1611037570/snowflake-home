import { computed } from 'vue'

/**
 * 通用排序控制器 Hook
 * 职责：管理单步执行和重置逻辑（已精简自动播放功能）
 *
 * @param {Object} options 配置项
 * @param {Function} options.executeSingleStep 执行单步动画的函数，返回 Promise<boolean> (true=还有下一步, false=完成)
 * @param {Function} options.resetAlgorithm 重置算法状态的函数
 * @param {Ref<boolean>} options.isCompleted 算法是否已完成的状态引用
 * @param {Ref<boolean>} options.isAnimating 算法是否正在执行动画的状态引用
 */
export function useSortControl({ executeSingleStep, resetAlgorithm, isCompleted, isAnimating }) {
  // ==========================================
  // 操作方法
  // ==========================================

  // 单步执行
  const nextStep = () => {
    if (!isCompleted.value && !isAnimating.value) {
      executeSingleStep()
    }
  }

  // 重置所有状态
  const reset = () => {
    if (isAnimating.value) return
    resetAlgorithm()
  }

  // ==========================================
  // 派生状态
  // ==========================================

  const statusText = computed(() => {
    if (isCompleted.value) return '排序完成'
    if (isAnimating.value) return '动画进行中'
    return '等待开始'
  })

  return {
    status: {
      statusText,
    },
    actions: {
      nextStep,
      reset,
    },
  }
}
