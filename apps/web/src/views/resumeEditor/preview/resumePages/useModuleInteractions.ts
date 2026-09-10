/**
 * useModuleInteractions —— 编辑态模块交互状态
 *
 * 依据预览激活模块为每个渲染模块计算高亮轮廓类。
 */
import { computed, type ComputedRef, type Ref } from "vue";

/** useModuleInteractions 入参 */
interface UseModuleInteractionsOptions {
  isEdit: ComputedRef<boolean>;
  /** 测量结果（模块 + 行高），用于生成每个模块的高亮映射 */
  moduleList: Ref<any[]>;
  /** 预览选择按钮激活的模块列表，仅用于悬浮边框颜色 */
  selectedModule: Ref<any[]>;
  /** 编辑区定位后激活的预览模块 key */
  activeModuleKey: Ref<string | null>;
}

export const useModuleInteractions = ({
  isEdit,
  moduleList,
  selectedModule,
  activeModuleKey,
}: UseModuleInteractionsOptions) => {
  // 选择按钮状态只决定悬浮边框颜色，不决定模块是否持续显示边框
  const selectedKeys = computed(() => new Set(selectedModule.value.map((item) => item.key)));
  // 搜索定位状态独立控制固定主题边框，鼠标经过模块后由父级清除该状态
  const moduleClassMap = computed(() => {
    if (!isEdit.value) return {};
    const map: Record<string, string> = {};
    for (const mod of moduleList.value) {
      map[mod.moduleKey] = activeModuleKey.value === mod.moduleKey
        ? "outline-2 outline-offset-3 outline-dashed outline-sf-theme"
        // 已选择模块悬浮时使用主题色，未选择模块悬浮时使用主题浅色
        : selectedKeys.value.has(mod.moduleKey)
          ? "outline-2 outline-offset-3 outline-dashed outline-transparent hover:outline-sf-theme"
          : "outline-2 outline-offset-3 outline-dashed outline-transparent hover:outline-sf-theme-2";
    }
    return map;
  });

  return { moduleClassMap };
};
