/**
 * useModuleInteractions —— 编辑态模块交互状态
 *
 * 依据选中模块集合为每个渲染模块计算高亮轮廓类，
 * 并透出模块草稿接受/放弃回调，供 ModuleSlot 使用。
 */
import { computed, inject, type ComputedRef, type Ref } from "vue";

/** useModuleInteractions 入参 */
interface UseModuleInteractionsOptions {
  isEdit: ComputedRef<boolean>;
  /** 测量结果（模块 + 行高），用于生成每个模块的高亮映射 */
  moduleList: Ref<any[]>;
  /** 已选中的模块列表（来自 resume store） */
  selectedModule: Ref<any[]>;
}

export const useModuleInteractions = ({
  isEdit,
  moduleList,
  selectedModule,
}: UseModuleInteractionsOptions) => {
  // 从编辑器根注入模块草稿接受/放弃回调
  const acceptModule = inject<(moduleKey: string) => void>("acceptModule", () => {});
  const rejectModule = inject<(moduleKey: string) => void>("rejectModule", () => {});

  // 选中的模块 key 集合
  const selectedKeys = computed(() => new Set(selectedModule.value.map((item) => item.key)));
  // 模块外层样式：编辑态渲染选中高亮与虚线框，非编辑态直接返回空对象
  const moduleClassMap = computed(() => {
    if (!isEdit.value) return {};
    const keys = selectedKeys.value;
    const map: Record<string, string> = {};
    for (const mod of moduleList.value) {
      map[mod.moduleKey] = keys.has(mod.moduleKey)
        ? "outline-2 outline-offset-3 outline-dashed outline-sf-theme"
        : "outline-2 outline-offset-3 outline-dashed outline-transparent hover:outline-sf-theme-2";
    }
    return map;
  });

  return { moduleClassMap, acceptModule, rejectModule };
};