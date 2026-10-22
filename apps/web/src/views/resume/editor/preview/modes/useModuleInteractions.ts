/**
 * useModuleInteractions —— 编辑态模块交互状态
 *
 * 依据预览激活模块为每个渲染模块计算高亮轮廓类。
 */
import { computed, type ComputedRef, type Ref } from "vue";

/** 标语属于版头区域，不参与模块悬浮轮廓反馈 */
const NO_HOVER_OUTLINE_KEYS = new Set(["slogan"]);

/** useModuleInteractions 入参 */
interface UseModuleInteractionsOptions {
  /** 当前是否处于可编辑的预览场景 */
  isEdit: ComputedRef<boolean>;
  /** 左侧是否打开智能助手标签 */
  aiPanelActive?: Ref<boolean>;
  /** 左侧是否打开普通编辑标签，模板标签不显示编辑定位反馈 */
  editorPanelActive?: Ref<boolean>;
  /** 是否正在导出，导出期间关闭全部编辑装饰 */
  isPrinting?: Ref<boolean>;
  /** 当前页面计划中的模块 key，用于生成每个渲染模块的高亮映射 */
  moduleKeys: Ref<string[]>;
  /** 预览选择按钮激活的模块列表，选中时持续显示主题边框 */
  selectedModule: Ref<any[]>;
  /** 编辑区定位后激活的预览模块 key */
  activeModuleKey: Ref<string | null>;
  /** 当前编辑模块标识，持续显示编辑边框且不触发滚动 */
  editingModuleKey?: Ref<string | null>;
  /** 当前编辑子模块的记录下标，空值表示整个模块 */
  editingItemIndex?: Ref<number | null>;
}

export const useModuleInteractions = ({
  isEdit,
  moduleKeys,
  selectedModule,
  activeModuleKey,
  editingModuleKey,
  editingItemIndex,
  aiPanelActive,
  editorPanelActive,
  isPrinting,
}: UseModuleInteractionsOptions) => {
  // 非编辑预览及导出期间，不显示按钮、提示或任何交互轮廓。
  const showEditorInteractions = computed(() => isEdit.value && !isPrinting?.value);
  // 智能助手选中反馈只在智能助手标签显示，切换标签不清除已有选择数据。
  const canSelectModules = computed(
    () => showEditorInteractions.value && Boolean(aiPanelActive?.value),
  );
  const selectedModuleKeys = computed(() =>
    canSelectModules.value ? selectedModule.value.map((item) => item.key) : [],
  );
  const selectedKeys = computed(() => new Set(selectedModuleKeys.value));
  // 编辑定位反馈只在普通编辑标签显示，智能助手与模板标签均不沿用。
  const showEditingFeedback = computed(
    () => showEditorInteractions.value && (editorPanelActive?.value ?? !aiPanelActive?.value),
  );
  // 当前编辑提示与编辑边框共用同一标签和导出判断。
  const visibleEditingModuleKey = computed(() =>
    showEditingFeedback.value ? (editingModuleKey?.value ?? null) : null,
  );
  const visibleEditingItemIndex = computed(() =>
    showEditingFeedback.value ? (editingItemIndex?.value ?? null) : null,
  );
  const baseOutline = "resume-module-interaction outline-2 outline-offset-3 outline-dashed";
  const getModuleClass = (moduleKey: string) => {
    // 标语属于主题版头，不展示模块交互边框。
    if (NO_HOVER_OUTLINE_KEYS.has(moduleKey)) return "";
    // 智能助手选中的模块持续显示主题边框。
    if (selectedKeys.value.has(moduleKey)) return `${baseOutline} outline-sf-theme`;
    // 普通编辑或搜索定位的模块显示主题边框，其他标签不沿用定位状态。
    if (
      showEditingFeedback.value &&
      ((visibleEditingModuleKey.value === moduleKey && visibleEditingItemIndex.value === null) ||
        activeModuleKey.value === moduleKey)
    )
      return `${baseOutline} outline-sf-theme`;
    // 其他模块仅在鼠标悬停时显示弱化轮廓。
    return `${baseOutline} outline-transparent hover:outline-sf-theme-2`;
  };
  const moduleClassMap = computed(() => {
    // 导出及只读场景返回空映射，避免内容树携带交互轮廓。
    if (!showEditorInteractions.value) return {};
    const map: Record<string, string> = {};
    for (const moduleKey of moduleKeys.value) {
      map[moduleKey] = getModuleClass(moduleKey);
    }
    return map;
  });

  return {
    moduleClassMap, // 各模块的交互轮廓样式。
    showEditorInteractions, // 是否显示预览编辑操作。
    canSelectModules, // 是否提供智能助手模块选择。
    selectedModuleKeys, // 当前允许展示选中反馈的模块标识。
    visibleEditingModuleKey, // 当前允许展示编辑提示的模块标识。
    visibleEditingItemIndex, // 当前允许展示编辑提示的子模块下标。
  };
};
