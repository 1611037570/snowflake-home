import { reactive, ref } from "vue";

// 初始排序数据
const ORIGINAL_DATA = [25, 10, 45, 30, 60, 15, 35, 50];

// ==========================================
// 纯算法逻辑层 (与 Vue 无关)
// ==========================================

/**
 * 冒泡排序生成器函数
 * 将排序算法的执行过程转化为一系列可暂停的步骤
 * @param {Array} initialData 初始数据副本
 */
function* createBubbleSortGenerator(initialData) {
  const arr = [...initialData]; // 创建影子数组用于逻辑计算
  const len = arr.length;

  for (let i = 0; i < len - 1; i++) {
    let swapped = false;

    // 每一轮比较到 len - 1 - i
    for (let j = 0; j < len - 1 - i; j++) {
      const val1 = arr[j];
      const val2 = arr[j + 1];

      // 步骤1：产出比较指令
      yield {
        type: "COMPARE",
        indices: [j, j + 1],
        values: [val1, val2],
        round: i,
      };

      // 检查是否需要交换
      if (val1 > val2) {
        // 步骤2：产出交换指令
        yield {
          type: "SWAP",
          indices: [j, j + 1],
          values: [val1, val2],
          round: i,
        };

        // 算法内部执行交换，保持状态同步
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }

    // 步骤3：产出本轮结束指令
    yield {
      type: "ROUND_END",
      round: i,
      swappedInRound: swapped,
    };

    // 优化：如果本轮没有交换，说明已排序完成
    if (!swapped) break;
  }

  // 步骤4：产出全部完成指令
  yield { type: "FINISH" };
}

// ==========================================
// 视图模型层 (Vue Hook)
// ==========================================

/**
 * 冒泡排序逻辑 Hook
 * 职责：只负责单步动画的执行和状态映射，不管理自动播放逻辑
 */
export function useBubbleSort() {
  // ==========================================
  // 核心数据状态
  // ==========================================

  // 排序数据数组（使用 ref 响应式存储）
  const data = ref([...ORIGINAL_DATA]);

  // ==========================================
  // 运行状态标志
  // ==========================================

  const isCompleted = ref(false); // 是否完成
  const isAnimating = ref(false); // 是否正在执行动画

  // ==========================================
  // 排序过程可视化状态
  // ==========================================

  const currentIndex = ref(-1); // 当前操作索引
  const currentRound = ref(0); // 当前轮次
  const isComparing = ref(false); // 是否显示比较状态
  const isSwapping = ref(false); // 是否显示交换状态
  const comparisonText = ref('点击"下一步"按钮开始排序'); // 状态文本描述

  // ==========================================
  // 统计数据
  // ==========================================

  const comparisonCount = ref(0);
  const swapCount = ref(0);

  // ==========================================
  // 内部控制变量
  // ==========================================

  let sortIterator = null; // 算法生成器实例

  // ==========================================
  // 工具函数
  // ==========================================

  // 单步动画时长，与 CSS transition-duration 保持一致
  // BubbleVisualizer.vue 中使用的是 duration-500
  const ANIMATION_DURATION = 500;
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // ==========================================
  // 核心动画管理逻辑
  // ==========================================

  /**
   * 初始化排序
   */
  const initSort = () => {
    sortIterator = createBubbleSortGenerator(ORIGINAL_DATA);
    isCompleted.value = false;
    currentIndex.value = -1;
    currentRound.value = 0;
    comparisonCount.value = 0;
    swapCount.value = 0;
    comparisonText.value = "准备开始...";
  };

  /**
   * 执行单步动画
   * 从生成器获取下一步指令，并映射为 UI 动画
   * @returns {Promise<boolean>} 是否还有下一步
   */
  const executeSingleStep = async () => {
    // 防止重入
    if (isAnimating.value || isCompleted.value) return false;

    // 如果没有生成器实例，初始化
    if (!sortIterator) {
      initSort();
    }

    isAnimating.value = true;

    // 循环直到找到一个需要可视化的步骤，或者结束
    // 这样可以自动跳过 ROUND_END 等纯逻辑步骤
    while (true) {
      const { value: step, done } = sortIterator.next();

      if (done || step.type === "FINISH") {
        isCompleted.value = true;
        isAnimating.value = false;
        comparisonText.value = "排序完成！";
        sortIterator = null;
        return false;
      }

      // 处理不同的指令
      if (step.type === "ROUND_END") {
        // 纯逻辑步骤，立即执行更新并继续下一次循环
        currentRound.value = step.round + 1;
        currentIndex.value = -1;
        continue;
      }

      if (step.type === "COMPARE") {
        await handleCompareStep(step);
        break; // 视觉步骤执行完毕，跳出循环，等待下一次用户操作
      }

      if (step.type === "SWAP") {
        await handleSwapStep(step);
        break; // 视觉步骤执行完毕，跳出循环，等待下一次用户操作
      }
    }

    // 步骤结束处理
    isComparing.value = false;
    isSwapping.value = false;
    isAnimating.value = false;

    return true;
  };

  // 处理比较指令
  const handleCompareStep = async ({ indices, values }) => {
    // 更新可视化状态
    currentIndex.value = indices[0];
    isComparing.value = true;
    isSwapping.value = false;

    // 更新统计和文本
    comparisonCount.value++;
    const [val1, val2] = values;
    const shouldSwap = val1 > val2;
    comparisonText.value = `${val1} ${val1 > val2 ? ">" : "<"} ${val2} ${shouldSwap ? "(需交换)" : "(无需交换)"}`;

    // 仅等待一次动画时间，让用户看清
    await delay(ANIMATION_DURATION);
  };

  // 处理交换指令
  const handleSwapStep = async ({ indices, values }) => {
    // 更新可视化状态
    isComparing.value = false;
    isSwapping.value = true;

    // 更新统计和文本
    swapCount.value++;
    const [val1, val2] = values;
    comparisonText.value = `交换: ${val1} ↔ ${val2}`;

    // 执行实际的数据变更 (驱动 Vue 响应式更新)
    const [idx1, idx2] = indices;
    const temp = data.value[idx1];
    data.value[idx1] = data.value[idx2];
    data.value[idx2] = temp;

    await delay(ANIMATION_DURATION);
  };

  const reset = () => {
    if (isAnimating.value) return;

    data.value = [...ORIGINAL_DATA];
    isCompleted.value = false;
    currentIndex.value = -1;
    currentRound.value = 0;
    comparisonCount.value = 0;
    swapCount.value = 0;
    comparisonText.value = '点击"下一步"按钮开始排序';
    isComparing.value = false;
    isSwapping.value = false;
    sortIterator = null;
  };

  return {
    data,
    status: reactive({
      isCompleted,
      isAnimating,
    }),
    state: reactive({
      currentIndex,
      currentRound,
      isComparing,
      isSwapping,
      comparisonText,
    }),
    counters: reactive({
      comparisonCount,
      swapCount,
    }),
    actions: {
      executeSingleStep,
      reset,
    },
  };
}
