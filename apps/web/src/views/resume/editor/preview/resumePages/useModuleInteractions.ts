/**
 * useModuleInteractions —— 编辑态模块交互状态
 *
 * 依据预览激活模块为每个渲染模块计算高亮轮廓类。
 */
import { computed, type ComputedRef, type Ref } from "vue";

/** useModuleInteractions 入参 */
interface UseModuleInteractionsOptions {
  isEdit: ComputedRef<boolean>;
  /** 当前页面计划中的模块 key，用于生成每个渲染模块的高亮映射 */
  moduleKeys: Ref<string[]>;
  /** 编辑区定位后激活的预览模块 key */
  activeModuleKey: Ref<string | null>;
}

export const useModuleInteractions = ({
  isEdit,
  moduleKeys,
  activeModuleKey,
}: UseModuleInteractionsOptions) => {
  // 搜索定位状态独立控制主题边框，鼠标进入模块后清除
  const moduleClassMap = computed(() => {
    if (!isEdit.value) return {};
    const map: Record<string, string> = {};
    for (const moduleKey of moduleKeys.value) {
      map[moduleKey] = activeModuleKey.value === moduleKey
        ? "outline-4 outline-offset-3 outline-dashed outline-sf-theme"
        : "outline-4 outline-offset-3 outline-dashed outline-transparent hover:outline-sf-theme";
    }
    return map;
  });

  return { moduleClassMap };
};
