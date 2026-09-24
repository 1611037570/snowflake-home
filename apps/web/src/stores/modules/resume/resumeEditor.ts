import {
  addArrayRecord,
  createDataPathContext,
  getFieldDataPath,
  moveArrayRecord,
  removeArrayRecord,
  setFieldCheckValue,
  walkFormFields,
} from "@/components/business/dynamicForm/api";
import { computed, ref, toRaw, watch, type ComputedRef } from "vue";
import {
  ALL_MODULE_KEY,
  DEFAULT_MODULE_NAMES,
} from "./defaultConfig";
import {
  bindCollapsedDefault,
  buildRuntimeConfig,
  compactConfigFields,
} from "./hooks/useConfigTemplate";
import { isEqual } from "lodash-es";
import { executeResumeOperations, type ResumeWriteOp } from "./resumeOperations";

type ResumeEditorOptions = {
  currentItem: ComputedRef<any>;
  currentData: ComputedRef<any>;
  itemDefaultCollapsed: ComputedRef<string[]>;
};

export const createResumeEditor = ({
  currentItem,
  currentData,
  itemDefaultCollapsed,
}: ResumeEditorOptions) => {
  const currentConfig = computed({
    get() {
      const item = currentItem.value;
      return item ? item.config : undefined;
    },
    set(newConfig: any) {
      const item = currentItem.value;
      if (item) item.config = newConfig;
    },
  });
  // 编辑器会话配置：从持久化 key 展开，完整 schema 只存在于运行时
  const runtimeConfig = ref<any>(null);
  const runtimeFields = computed(() => runtimeConfig.value?.fields || []);
  const refreshRuntime = () => {
    const item = currentItem.value;
    if (!item) {
      runtimeConfig.value = null;
      return;
    }
    const runtime = buildRuntimeConfig(item.config, item.data);
    // 记录折叠默认值按系统设置读取，仅影响新增记录
    bindCollapsedDefault(runtime.fields, () => itemDefaultCollapsed.value);
    runtimeConfig.value = runtime;
  };
  // 切简历/新建/恢复时按最新模板重建运行时配置
  watch(currentItem, refreshRuntime, { immediate: true });
  // 持久化字段列表写入：内容一致时跳过，避免无谓变更（入参须为已投影的字段列表）
  const setConfigFields = (item: any, fields: any[]) => {
    if (!item) return;
    const config = item.config && typeof item.config === "object" ? item.config : {};
    if (isEqual(config.fields || [], fields)) return;
    config.fields = structuredClone(fields);
  };
  // 模块与内部字段排序只改运行时 fields，变化后按投影回写持久化顺序
  watch(
    () => compactConfigFields(runtimeConfig.value?.fields || []),
    (projectedFields) => setConfigFields(currentItem.value, projectedFields),
  );
  // 整体恢复配置：AI 撤回等场景使用，结构变化时同步重建运行时配置
  const restoreConfig = (config: any) => {
    const item = currentItem.value;
    if (!item) return;
    const next = config && typeof config === "object" ? structuredClone(toRaw(config)) : {};
    // 仅结构变化才重建运行时配置，避免无关恢复触发表单整表重建
    const configChanged = !isEqual(toRaw(item.config), next);
    item.config = next;
    if (configChanged) refreshRuntime();
  };
  const currentUI = computed({
    get() {
      const item = currentItem.value;
      return item ? item.ui : undefined;
    },
    set(newUI: any) {
      const item = currentItem.value;
      if (item) item.ui = newUI;
    },
  });
  const currentUsage = computed(() => {
    const item = currentItem.value;
    return item ? item.usage : undefined;
  });
  // 选中模块的名称列表
  const selectedModule = ref<any[]>([]);
  const getModel = (key: string): any => {
    if (!key) return;
    // 模块展示标题统一读取 ui.title
    const moduleTitle = currentData.value?.[key]?.ui?.title;
    const found = DEFAULT_MODULE_NAMES.find((item) => item.key === key);
    if (moduleTitle) return { key, name: moduleTitle };
    return found ? { key: found.key, name: found.name } : undefined;
  };
  const selectModule = (key: string) => {
    const model = getModel(key);
    if (!model?.key) return;
    if (!selectedModule.value.some((item) => item.key === key)) {
      selectedModule.value.push(model);
    }
  };
  const unselectModule = (key: string) => {
    if (key === ALL_MODULE_KEY) return;
    selectedModule.value = selectedModule.value.filter((item) => item.key !== key);
  };
  const clearSelectedModules = () => {
    selectedModule.value = [];
  };
  const setSelectedModules = (modules: any[]) => {
    selectedModule.value = modules;
  };
  const resolveModuleRecords = (module: any): any[] | null => {
    if (!module || typeof module !== "object") return null;
    if (Array.isArray(module.list)) return module.list;
    return null;
  };
  const findModuleArrayField = (fields: any[] | undefined, moduleKey: string) => {
    const moduleField = fields?.find((field: any) => field?.key === moduleKey);
    const field = moduleField?.fields?.find((item: any) => item?.type === "array");
    if (!field || !Array.isArray(moduleField?.context)) return;
    return { field, context: createDataPathContext(moduleField.context) };
  };
  const findAddableModuleField = (
    fields: any[] | undefined,
    moduleKey: string,
    field: string,
  ) => {
    const moduleField = fields?.find((item: any) => item?.key === moduleKey);
    let result: any;
    walkFormFields(moduleField, (item) => {
      if (result || item.addable !== true) return;
      const source = getFieldDataPath(item);
      if (source?.length === 2 && source[0] === "data" && source[1] === field) {
        result = item;
      }
    });
    return result;
  };
  function addDataRecord(moduleKey: string): number {
    const target = findModuleArrayField(runtimeConfig.value?.fields, moduleKey);
    if (!target) return -1;
    return addArrayRecord(currentData.value, target.field, target.context);
  }
  function removeDataRecord(moduleKey: string, index: number): boolean {
    const target = findModuleArrayField(runtimeConfig.value?.fields, moduleKey);
    if (!target) return false;
    return removeArrayRecord(currentData.value, target.field, index, target.context);
  }
  function moveDataRecord(moduleKey: string, from: number, to: number): boolean {
    const target = findModuleArrayField(runtimeConfig.value?.fields, moduleKey);
    if (!target) return false;
    return moveArrayRecord(currentData.value, target.field, from, to, target.context);
  }
  function updateModuleField(moduleKey: string, field: string, value: unknown): boolean {
    const module = currentData.value?.[moduleKey];
    if (
      !module ||
      !module.data ||
      typeof module.data !== "object" ||
      Array.isArray(module.data)
    ) {
      return false;
    }
    const hasField = Object.prototype.hasOwnProperty.call(module.data, field);
    if (!hasField && !findAddableModuleField(runtimeConfig.value?.fields, moduleKey, field)) {
      return false;
    }
    module.data[field] = value;
    return true;
  }
  function updateModuleTitle(moduleKey: string, title: string): boolean {
    const module = currentData.value?.[moduleKey];
    const value = title.trim();
    if (!module || typeof module !== "object" || !value) return false;
    module.ui ||= {};
    module.ui.title = value;
    return true;
  }
  const findModuleField = (moduleKey: string) =>
    runtimeConfig.value?.fields?.find((field: any) => field?.key === moduleKey);
  function setModuleHidden(moduleKey: string, hidden: boolean): boolean {
    const field = findModuleField(moduleKey);
    if (!field) return false;
    setFieldCheckValue(currentData.value, field, "hidden", hidden);
    return true;
  }
  function setModuleArchived(moduleKey: string, archived: boolean): boolean {
    const field = findModuleField(moduleKey);
    if (!field) return false;
    setFieldCheckValue(currentData.value, field, "removed", archived);
    if (archived) unselectModule(moduleKey);
    return true;
  }
  function removeModule(moduleKey: string): boolean {
    const fields = runtimeConfig.value?.fields;
    const index = fields?.findIndex((field: any) => field?.key === moduleKey) ?? -1;
    if (index < 0) return false;
    fields.splice(index, 1);
    if (currentData.value) delete currentData.value[moduleKey];
    unselectModule(moduleKey);
    return true;
  }
  function setPageLayout(pageLayout: Record<string, any> | null): boolean {
    if (!currentUI.value) return false;
    currentUI.value.pageLayout = pageLayout ? JSON.parse(JSON.stringify(pageLayout)) : null;
    return true;
  }
  function swapModuleOrder(firstKey: string, secondKey: string): boolean {
    const fields = runtimeConfig.value?.fields;
    if (!Array.isArray(fields)) return false;
    if (firstKey === "user" || secondKey === "user") return false;
    const firstIndex = fields.findIndex((field: any) => field?.key === firstKey);
    const secondIndex = fields.findIndex((field: any) => field?.key === secondKey);
    if (firstIndex < 0 || secondIndex < 0) return false;
    const [first] = fields.splice(firstIndex, 1);
    fields.splice(secondIndex, 0, first);
    return true;
  }
  function updateRecordField(
    moduleKey: string,
    index: number,
    field: string,
    value: unknown,
  ): boolean {
    const records = resolveModuleRecords(currentData.value?.[moduleKey]);
    const record = records?.[index];
    if (!record?.data || typeof record.data !== "object" || !(field in record.data)) return false;
    record.data[field] = value;
    return true;
  }
  function applyResumeOperations(operations: ResumeWriteOp[]) {
    return executeResumeOperations(operations, {
      addDataRecord,
      removeDataRecord,
      moveDataRecord,
      updateModuleField,
      updateModuleTitle,
      updateRecordField,
    });
  }

  return {
    currentConfig,
    runtimeConfig,
    runtimeFields,
    setConfigFields,
    restoreConfig,
    currentUI,
    currentUsage,
    selectedModule,
    getModel,
    selectModule,
    unselectModule,
    clearSelectedModules,
    setSelectedModules,
    addDataRecord,
    removeDataRecord,
    moveDataRecord,
    updateModuleField,
    updateModuleTitle,
    setModuleHidden,
    setModuleArchived,
    removeModule,
    setPageLayout,
    swapModuleOrder,
    updateRecordField,
    applyResumeOperations,
    compactConfigFields,
  };
};
