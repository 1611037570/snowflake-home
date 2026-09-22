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
  /** 预览选择按钮激活的模块列表，仅用于悬浮边框颜色 */
  selectedModule: Ref<any[]>;
  /** 编辑区定位后激活的预览模块 key */
  activeModuleKey: Ref<string | null>;
}

export const useModuleInteractions = ({
  isEdit,
  moduleKeys,
  selectedModule,
  activeModuleKey,
}: UseModuleInteractionsOptions) => {
  // 选择按钮状态只决定悬浮边框颜色，不决定模块是否持续显示边框
  const selectedKeys = computed(() => new Set(selectedModule.value.map((item) => item.key)));
  // 搜索定位状态独立控制主题边框，鼠标进入模块后清除
  const moduleClassMap = computed(() => {
    if (!isEdit.value) return {};
    const map: Record<string, string> = {};
    for (const moduleKey of moduleKeys.value) {
      map[moduleKey] = activeModuleKey.value === moduleKey
        ? "outline-2 outline-offset-3 outline-dashed outline-sf-theme"
        // 已选择模块悬浮时使用主题色，未选择模块悬浮时使用主题浅色
        : selectedKeys.value.has(moduleKey)
          ? "outline-2 outline-offset-3 outline-dashed outline-transparent hover:outline-sf-theme"
          : "outline-2 outline-offset-3 outline-dashed outline-transparent hover:outline-sf-theme-2";
    }
    return map;
  });

  return { moduleClassMap };
};
