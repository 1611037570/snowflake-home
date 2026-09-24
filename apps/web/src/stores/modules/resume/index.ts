import confirm from "@/components/business/confirm";
import { ElMessage } from "element-plus";
import {
  addArrayRecord,
  createDataPathContext,
  getFieldDataPath,
  moveArrayRecord,
  removeArrayRecord,
  setFieldCheckValue,
  walkFormFields,
} from "@/components/business/dynamicForm/api";
import router from "@/routers";
import { useAiStore } from "@/stores/modules/ai";
import { getUUID } from "@/utils";
import { defineStore } from "pinia";
import { computed, ref, shallowRef, toRaw, watch } from "vue";
import {
  ALL_MODULE_KEY,
  DEFAULT_MODULE_NAMES,
  DEFAULT_RESUME_ITEM,
  DEFAULT_EDITOR,
  DEFAULT_SYSTEM,
} from "./defaultConfig";
import { COLLAPSED, EXPANDED } from "./formConfig";
import { DEFAULT_UI } from "./uiConfig";
import {
  bindCollapsedDefault,
  buildRuntimeConfig,
  compactConfigFields,
} from "./hooks/useConfigTemplate";
import { debounce, isEqual, merge } from "lodash-es";
import { createResumeStorage } from "./resumeStorage";
import { executeResumeOperations, type ResumeWriteOp } from "./resumeOperations";
import {
  createResumeListItem,
  removeAiChatSummaries,
  removeResumeListItem,
  setResumeDeletedAt,
  type AiChatSummary,
  type ResumeListItem,
  upsertAiChatSummary,
} from "./resumeCatalog";
export type DesensitizeLevel = "normal" | "strict";
export type DesensitizeConfig = {
  disabled: boolean;
  level: DesensitizeLevel;
};

export const useResumeStore = defineStore(
  "resume",
  () => {
    // 简历目录只保存简历 ID、AI 会话摘要和软删除时间，由 Pinia 持久化到 localStorage
    const list = ref<ResumeListItem[]>([]);
    // 简历正文仅在运行时按目录加载，不作为目录持久化内容
    const resumeRecords = ref<any[]>([]);
    const resumeList = computed(() =>
      resumeRecords.value.filter(
        (resume) => list.value.find((item) => item.id === resume.id)?.deletedAt === null,
      ),
    );
    const trashList = computed(() =>
      list.value
        .filter((item) => item.deletedAt !== null)
        .map((entry) => {
          const resume = resumeRecords.value.find((item) => item.id === entry.id);
          return resume ? { ...resume, _deletedAt: entry.deletedAt } : null;
        })
        .filter(Boolean),
    );
    const { getResumeStorage, loadResumeItems, removeResumeStorage, schedulePersistResume } =
      createResumeStorage({ defaultUI: DEFAULT_UI });
    let initPromise: Promise<void> | null = null;
    // 简历最大数量
    const maxCount = 10;
    // 回收站最大数量
    const maxTrashCount = 10;
    // 回收站保留天数：超过后自动清理
    const trashRetentionDays = 30;
    // 回收站保留时长（毫秒）：由 trashRetentionDays 换算
    const trashRetentionMs = trashRetentionDays * 24 * 60 * 60 * 1000;
    // 当前选中的简历下标
    const currentIndex = ref(-1);
    // 编辑器区域宽度
    const editorWidth = ref(DEFAULT_EDITOR.editorWidth);
    // 专注写作模式（临时状态，不持久化）
    const focusMode = ref(false);
    // AI 请求脱敏配置：禁用时不脱敏，否则按等级过滤敏感字段
    const desensitizeMode = ref<DesensitizeConfig>({
      disabled: true,
      level: "normal",
    });
    // 是否正在打印
    const isPrinting = ref(false);
    let printController: AbortController | null = null;
    // 开始导出并创建可取消信号
    const beginPrinting = () => {
      if (isPrinting.value) return null;
      const controller = new AbortController();
      printController = controller;
      isPrinting.value = true;
      return controller.signal;
    };
    // 取消当前导出
    const cancelPrinting = () => {
      printController?.abort();
      printController = null;
      isPrinting.value = false;
    };
    // 仅结束当前导出，避免旧任务影响新任务状态
    const finishPrinting = (signal: AbortSignal) => {
      if (printController?.signal !== signal) return;
      printController = null;
      isPrinting.value = false;
    };
    // 智能一页压缩中：复用导出遮罩，屏蔽试参数过程中的排版变化
    const isFittingOnePage = ref(false);
    let onePageController: AbortController | null = null;
    // 开始压缩并创建可取消信号
    const beginFittingOnePage = () => {
      if (isFittingOnePage.value) return null;
      const controller = new AbortController();
      onePageController = controller;
      isFittingOnePage.value = true;
      return controller.signal;
    };
    // 取消当前压缩
    const cancelFittingOnePage = () => {
      onePageController?.abort();
      onePageController = null;
      isFittingOnePage.value = false;
    };
    // 仅结束当前压缩，避免旧任务影响新任务状态
    const finishFittingOnePage = (signal: AbortSignal) => {
      if (onePageController?.signal !== signal) return;
      onePageController = null;
      isFittingOnePage.value = false;
    };
    // 是否AI生成中
    const isGenerating = ref(false);
    // 配置同步状态：编辑器表单渲染完成前为 true，供外壳展示加载提示
    const configSyncing = ref(true);
    const setConfigSyncing = (value: boolean) => {
      configSyncing.value = value;
    };
    // 预览渲染状态：预览页测量完成前为 true，供外壳展示加载提示
    const previewSyncing = ref(true);
    const setPreviewSyncing = (value: boolean) => {
      previewSyncing.value = value;
    };
    // 运行性能数据：记录简历编辑器与预览区的加载耗时及首屏首帧
    const runtimeData = ref({
      // 编辑区加载耗时
      editorDuration: 0,
      // 预览区加载耗时
      previewDuration: 0,
      // 简历编辑器首屏首帧时间
      firstFrame: 0,
      // 运行环境信息
      env: {} as Record<string, any>,
    });
    // 撤销历史栈：每个元素为修改前的内容快照字符串（data/config/ui），撤销时解析还原
    const undoStack = ref<string[]>([]);
    // 重做历史栈：结构与撤销栈相同
    const redoStack = ref<string[]>([]);
    // 撤销历史最大条数
    const maxHistory = 12;
    // 恢复快照时跳过下次监听的标志（撤销/重做触发的响应式变化不应再入栈）
    let skipNextWatch = false;
    // 上一次的内容快照字符串（data/config/ui），作为撤销历史基准：每次内容变化时把这份基准入栈
    let lastSnapshot: string | null = null;
    // 历史记录开关：仅在编辑器初始化完成后由 Builder 开启，离开编辑器时关闭
    const historyEnabled = ref(false);
    // 系统配置
    const system = ref(structuredClone(DEFAULT_SYSTEM));
    // 新增记录的默认折叠状态：由系统设置统一决定
    const itemDefaultCollapsed = computed(() =>
      system.value.defaultItemExpanded ? EXPANDED : COLLAPSED,
    );
    // 初始化状态
    function initResumeStatus() {
      // 重置打印状态
      printController?.abort();
      printController = null;
      isPrinting.value = false;
      // 切换简历时取消智能一页压缩
      onePageController?.abort();
      onePageController = null;
      isFittingOnePage.value = false;
      // 重置AI生成状态
      isGenerating.value = false;
      // 重置选中模块
      selectedModule.value = [];
    }
    // 当前选中的简历项
    const currentItem = computed(() => resumeList.value[currentIndex.value]);

    // 获取当前选中的简历数据
    const currentData = computed(() => {
      const item = currentItem.value;
      return item ? item.data : undefined;
    });

    // 获取当前选中的表单配置
    const currentConfig = computed({
      get() {
        const item = currentItem.value;
        return item ? item.config : undefined;
      },
      set(newConfig: any) {
        const item = currentItem.value;
        if (item) {
          item.config = newConfig;
        }
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
    // 获取当前选中的UI配置
    const currentUI = computed({
      get() {
        const item = currentItem.value;
        return item ? item.ui : undefined;
      },
      set(newUI: any) {
        const item = currentItem.value;
        if (item) {
          item.ui = newUI;
        }
      },
    });
    const currentUsage = computed(() => {
      const item = currentItem.value;
      return item ? item.usage : undefined;
    });
    // 选中模块的名称列表
    const selectedModule = ref<any[]>([]);
    // 获取模块名称
    const getModel = (key: string): any => {
      if (!key) return;
      // 模块展示标题统一读取 ui.title
      const moduleTitle = currentData.value?.[key]?.ui?.title;
      const found = DEFAULT_MODULE_NAMES.find((item) => item.key === key);
      if (moduleTitle) return { key, name: moduleTitle };
      return found ? { key: found.key, name: found.name } : undefined;
    };
    // 选中模块：已存在则忽略，名称由 getModel 统一解析
    const selectModule = (key: string) => {
      const model = getModel(key);
      if (!model?.key) return;
      if (!selectedModule.value.some((item) => item.key === key)) {
        selectedModule.value.push(model);
      }
    };
    // 取消选中模块：“整个简历”占位项不允许移除
    const unselectModule = (key: string) => {
      if (key === ALL_MODULE_KEY) return;
      selectedModule.value = selectedModule.value.filter((item) => item.key !== key);
    };
    // 清空选中模块
    const clearSelectedModules = () => {
      selectedModule.value = [];
    };
    // 整体替换选中模块：导出恢复、跳转定位等场景使用
    const setSelectedModules = (modules: any[]) => {
      selectedModule.value = modules;
    };
    // 新增简历：jump 控制是否跳转编辑器，select 控制是否选中新简历
    const addResume = (config: any, jump = true, select = true) => {
      if (resumeList.value.length >= maxCount) {
        confirm(`请前往我的简历管理删除后再新建。`, "容量已满").then(() => {
          router.push("/resume/mine");
        });
        return false;
      }
      const res = config ? mergeResumeItem(config) : structuredClone(DEFAULT_RESUME_ITEM);
      // 持久化只保留模块 key，完整 schema 由运行时按模板展开
      setConfigFields(res, compactConfigFields(res.config.fields));
      // 每次新增都重新生成唯一ID，避免多份简历共用一个ID
      res.id = getUUID().slice(0, 6);
      // 新简历使用独立 IndexedDB key 保存完整对象
      const storage = getResumeStorage(res.id, res, true);
      resumeRecords.value.push(storage.data.value);
      list.value.unshift(createResumeListItem(res.id));
      if (select) {
        currentIndex.value = resumeList.value.length - 1;
        if (jump) router.push({ path: "/resume/editor", query: { id: res.id } });
      }
      return true;
    };
    // 深拷贝快照：先脱响应式代理再递归克隆，原始字符串直接复用引用，避免 JSON 中转大字段开销
    const deepClone = (value: any): any => {
      if (value == null) return value;
      const raw = toRaw(value);
      if (typeof raw !== "object") return raw;
      if (raw instanceof Date) return new Date(raw.getTime());
      if (raw instanceof RegExp) return new RegExp(raw.source, raw.flags);
      if (raw instanceof Map) {
        return new Map([...raw].map(([key, item]) => [deepClone(key), deepClone(item)]));
      }
      if (raw instanceof Set) {
        return new Set([...raw].map(deepClone));
      }
      const result: any = Array.isArray(raw) ? [] : {};
      for (const key of Object.keys(raw)) {
        result[key] = deepClone(raw[key]);
      }
      return result;
    };
    // 深拷贝指定简历（缺省为当前简历）并创建独立的新简历
    const duplicateResume = (item?: any) => {
      const source = item ?? currentItem.value;
      if (!source) return false;
      const copy = deepClone(source);
      const now = Date.now();
      copy.usage = { ...copy.usage, createTime: now, lastUseTime: now };
      const currentCount = resumeList.value.length;
      if (!addResume(copy, false, false)) return "";
      return resumeList.value[currentCount]?.id || "";
    };
    // 所有数组模块统一将记录存放在 list
    const resolveModuleRecords = (module: any): any[] | null => {
      if (!module || typeof module !== "object") return null;
      if (Array.isArray(module.list)) return module.list;
      return null;
    };
    // 数组型模块新增记录：统一按运行时结构向真实数据追加默认记录
    function addDataRecord(moduleKey: string): number {
      const target = findModuleArrayField(runtimeConfig.value?.fields, moduleKey);
      if (!target) return -1;
      return addArrayRecord(currentData.value, target.field, target.context);
    }
    // 从运行时模块结构定位数组字段
    const findModuleArrayField = (fields: any[] | undefined, moduleKey: string) => {
      const moduleField = fields?.find((f: any) => f?.key === moduleKey);
      const field = moduleField?.fields?.find((item: any) => item?.type === "array");
      if (!field || !Array.isArray(moduleField?.context)) return;
      return { field, context: createDataPathContext(moduleField.context) };
    };
    // 从运行时表单结构定位模块级可添加字段
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
    // AI 删除记录：统一修改真实数据数组
    function removeDataRecord(moduleKey: string, index: number): boolean {
      const target = findModuleArrayField(runtimeConfig.value?.fields, moduleKey);
      if (!target) return false;
      return removeArrayRecord(currentData.value, target.field, index, target.context);
    }
    // AI 移动记录：统一调整真实数据数组顺序
    function moveDataRecord(moduleKey: string, from: number, to: number): boolean {
      const target = findModuleArrayField(runtimeConfig.value?.fields, moduleKey);
      if (!target) return false;
      return moveArrayRecord(currentData.value, target.field, from, to, target.context);
    }
    // 修改模块级 data 字段
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
    // 修改模块展示标题，标题统一存放在模块 ui.title
    function updateModuleTitle(moduleKey: string, title: string): boolean {
      const module = currentData.value?.[moduleKey];
      const value = title.trim();
      if (!module || typeof module !== "object" || !value) return false;
      module.ui ||= {};
      module.ui.title = value;
      return true;
    }
    // 从运行时配置定位模块字段：模块级状态操作统一按 key 查找
    const findModuleField = (moduleKey: string) =>
      runtimeConfig.value?.fields?.find((field: any) => field?.key === moduleKey);
    // 设置模块显隐：预览区按同一数据路径同步显隐
    function setModuleHidden(moduleKey: string, hidden: boolean): boolean {
      const field = findModuleField(moduleKey);
      if (!field) return false;
      setFieldCheckValue(currentData.value, field, "hidden", hidden);
      return true;
    }
    // 设置模块归档：归档后模块从编辑区移除，并同步取消模块选中
    function setModuleArchived(moduleKey: string, archived: boolean): boolean {
      const field = findModuleField(moduleKey);
      if (!field) return false;
      setFieldCheckValue(currentData.value, field, "removed", archived);
      if (archived) unselectModule(moduleKey);
      return true;
    }
    // 删除模块：移除运行时配置节点与数据，并同步取消模块选中
    function removeModule(moduleKey: string): boolean {
      const fields = runtimeConfig.value?.fields;
      const index = fields?.findIndex((field: any) => field?.key === moduleKey) ?? -1;
      if (index < 0) return false;
      fields.splice(index, 1);
      if (currentData.value) delete currentData.value[moduleKey];
      unselectModule(moduleKey);
      return true;
    }
    // 写入显式页面布局：预览区左右移动模块后，布局从主题模板物化为 ui.pageLayout。
    // 落库前深拷贝为纯对象，避免响应式代理导致持久化无法结构化克隆。
    function setPageLayout(pageLayout: Record<string, any> | null): boolean {
      if (!currentUI.value) return false;
      currentUI.value.pageLayout = pageLayout ? JSON.parse(JSON.stringify(pageLayout)) : null;
      return true;
    }
    // 交换两个模块的配置顺序：供预览区上下移动使用，个人信息模块固定不参与交换
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
    // 修改数组模块记录字段
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
    // 批量写操作统一通过领域执行器落到当前简历
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
    // 删除简历：移入回收站（回收站已满时阻止并提示）
    const deleteResume = () => {
      if (currentIndex.value == -1) {
        return;
      }
      // 回收站已满：阻止删除并提示先清理回收站
      if (trashList.value.length >= maxTrashCount) {
        confirm("回收站已满，请先清理回收站后再删除。", "回收站已满");
        return;
      }
      // 保留同一份完整简历数据，仅通过索引移动到回收站
      const deletedItem = resumeList.value[currentIndex.value];
      const entry = list.value.find((item) => item.id === deletedItem?.id);
      if (!entry) return;
      list.value[list.value.indexOf(entry)] = setResumeDeletedAt(entry, Date.now());
      useAiStore().clearCurrentResumeAssistantChat(deletedItem.id);
      currentIndex.value = -1;
    };
    // 从回收站恢复简历
    const restoreResume = (trashIndex: number) => {
      if (trashIndex < 0 || trashIndex >= trashList.value.length) return;
      if (resumeList.value.length >= maxCount) {
        ElMessage.warning(`简历数量已达到上限（${maxCount}个），请先删除其他简历。`);
        return;
      }
      const item = trashList.value[trashIndex];
      const entry = list.value.find((value) => value.id === item?.id);
      const resume = resumeRecords.value.find((value) => value.id === item?.id);
      if (!entry || !resume) return;
      list.value[list.value.indexOf(entry)] = setResumeDeletedAt(entry, null);
    };
    // 永久删除回收站中的简历
    const permanentlyDeleteResume = async (trashIndex: number) => {
      if (trashIndex < 0 || trashIndex >= trashList.value.length) return;
      const item = trashList.value[trashIndex];
      await useAiStore().removeResumeAssistantChats(item.id);
      list.value = removeResumeListItem(list.value, item.id);
      resumeRecords.value = resumeRecords.value.filter((resume) => resume.id !== item.id);
      await removeResumeStorage(item.id);
    };
    // 清空回收站内全部简历。
    const clearTrash = async () => {
      const ids = trashList.value.map((item) => item.id);
      for (const id of ids) {
        await useAiStore().removeResumeAssistantChats(id);
        await removeResumeStorage(id);
      }
      list.value = list.value.filter((entry) => !ids.includes(entry.id));
      resumeRecords.value = resumeRecords.value.filter((item) => !ids.includes(item.id));
    };
    // 清理回收站中超过保留天数的简历（每次进入简历页时调用）
    const cleanExpiredTrash = async () => {
      const now = Date.now();
      const expiredIds = list.value
        .filter((item) => item.deletedAt !== null && now - item.deletedAt >= trashRetentionMs)
        .map((item) => item.id);
      for (const id of expiredIds) {
        await useAiStore().removeResumeAssistantChats(id);
        await removeResumeStorage(id);
      }
      if (!expiredIds.length) return;
      list.value = list.value.filter((item) => !expiredIds.includes(item.id));
      resumeRecords.value = resumeRecords.value.filter((item) => !expiredIds.includes(item.id));
    };
    // 计算回收站简历剩余保留天数（0 表示即将清理）
    const getTrashRemainingDays = (item: any) => {
      const deletedAt = item?._deletedAt || 0;
      if (!deletedAt) return 0;
      const remaining = trashRetentionMs - (Date.now() - deletedAt);
      return remaining <= 0 ? 0 : Math.ceil(remaining / (24 * 60 * 60 * 1000));
    };
    const updateResumeAiChatSummary = async (resumeId: string, summary: AiChatSummary) => {
      const index = list.value.findIndex((item) => item.id === resumeId);
      const item = list.value[index];
      if (!item || item.deletedAt !== null) return false;
      list.value[index] = upsertAiChatSummary(item, summary);
      return true;
    };
    const clearResumeAiChatSummaries = async (resumeId: string) => {
      const index = list.value.findIndex((item) => item.id === resumeId);
      const item = list.value[index];
      if (!item) return [] as string[];
      const ids = item.ai.map((chat) => chat.id);
      list.value[index] = removeAiChatSummaries(item);
      return ids;
    };
    // 移除表单引擎渲染期补充的运行时 id（不参与内容差异比较）
    const removeRuntimeIds = (value: any): any => {
      if (Array.isArray(value)) {
        return value.map(removeRuntimeIds);
      }
      if (value && typeof value === "object") {
        return Object.fromEntries(
          Object.entries(value)
            .filter(([key]) => key !== "id")
            .map(([key, item]) => [key, removeRuntimeIds(item)]),
        );
      }
      return value;
    };
    // 序列化简历内容（排除 usage 与引擎补充的运行时 id），用于历史去重比较
    const serializeForCompare = (item: any) => {
      if (!item) return "";
      return JSON.stringify({
        data: item.data,
        config: removeRuntimeIds(item.config),
        ui: item.ui,
      });
    };
    // 防抖写入撤销历史：把 300ms 内的连续编辑合并为一条，防抖到期后才真正入栈
    const pushHistory = debounce((snapshot: string, resumeId: string) => {
      const item = currentItem.value;
      // 已切换简历则丢弃本次历史（避免旧简历内容记入新简历）
      if (!item || !snapshot || item.id !== resumeId) return;
      // 与栈顶内容相同则不重复记录
      if (undoStack.value[undoStack.value.length - 1] === snapshot) return;
      // 入栈内容快照字符串，撤销时解析还原，避免深拷贝整份简历
      undoStack.value.push(snapshot);
      // 超出上限丢最旧一条
      if (undoStack.value.length > maxHistory) {
        undoStack.value.shift();
      }
      // 出现新编辑后清空重做栈，避免前进到旧状态
      redoStack.value = [];
    }, 100);
    // 重置所有设置为默认值
    const resetSettings = () => {
      system.value = structuredClone(DEFAULT_SYSTEM);
    };
    // 防抖记录历史：连续编辑合并为一条，防抖到期后只对当前内容做一次序列化比较，不再深拷贝快照
    const recordHistory = debounce((item: any) => {
      const snapshot = serializeForCompare(item);
      // 内容相对上次快照有变化才记录一条历史，避免 usage 时间戳等无关变化入栈
      if (snapshot === lastSnapshot) return;
      // 将修改前的内容快照作为历史（防抖合并后入栈）
      pushHistory(lastSnapshot!, item?.id);
      // 更新基准快照为当前内容，作为下次变化时的"修改前状态"
      lastSnapshot = snapshot;
    }, 300);
    // 重置历史基准：取消防抖、清空历史栈并对齐当前简历快照（编辑器初始化完成后调用）
    const resetHistoryBase = () => {
      recordHistory.cancel();
      pushHistory.cancel();
      undoStack.value = [];
      redoStack.value = [];
      lastSnapshot = currentItem.value ? serializeForCompare(currentItem.value) : null;
    };
    // 开启历史记录：取消防抖等待并对齐当前简历快照（由 Builder 在同步完成后调用）
    const enableHistory = () => {
      recordHistory.cancel();
      pushHistory.cancel();
      lastSnapshot = currentItem.value ? serializeForCompare(currentItem.value) : null;
      historyEnabled.value = true;
    };
    // 关闭历史记录：取消防抖等待、清空历史栈并暂停记录（离开编辑器时调用）
    const disableHistory = () => {
      recordHistory.cancel();
      pushHistory.cancel();
      undoStack.value = [];
      redoStack.value = [];
      lastSnapshot = null;
      historyEnabled.value = false;
    };
    // 应用历史快照：只恢复内容字段（data/config/ui），保留 id 与 usage
    const applySnapshot = (snapshot: string) => {
      const item = currentItem.value;
      if (!item) return;
      const snapItem = JSON.parse(snapshot);
      // 模块配置是否变化：仅增删模块或调整顺序时才需要重建运行时配置（重建会重排表单 key 导致整表重建）
      const configChanged =
        JSON.stringify(removeRuntimeIds(item.config)) !== JSON.stringify(snapItem.config);
      // 恢复引发的响应式变化不应被记为新的历史，跳过下一次监听
      skipNextWatch = true;
      item.data = snapItem.data;
      item.config = snapItem.config;
      item.ui = snapItem.ui;
      // 恢复后同步基准快照，保证下次编辑以恢复后的状态为历史基准
      lastSnapshot = serializeForCompare(item);
      // 内容类改动无需重建运行时配置，避免撤回时整表重建造成卡顿
      if (configChanged) refreshRuntime();
    };
    // 撤回：当前状态入重做栈，再恢复撤销栈顶的修改前状态
    const undo = () => {
      // 先落库防抖等待中的历史，保证编辑后立即撤回也能生效
      recordHistory.flush();
      pushHistory.flush();
      const item = currentItem.value;
      if (!item || undoStack.value.length === 0) return;
      // 当前状态保存进重做栈，供"前进"恢复
      redoStack.value.push(serializeForCompare(item));
      if (redoStack.value.length > maxHistory) {
        redoStack.value.shift();
      }
      // 弹出并恢复最近一条历史快照
      applySnapshot(undoStack.value.pop()!);
    };
    // 重做：与撤回对称，恢复重做栈顶的快照
    const redo = () => {
      // 先落库防抖等待中的历史，保证操作顺序一致
      recordHistory.flush();
      pushHistory.flush();
      const item = currentItem.value;
      if (!item || redoStack.value.length === 0) return;
      // 当前状态保存进撤销栈，供再次"撤回"
      undoStack.value.push(serializeForCompare(item));
      if (undoStack.value.length > maxHistory) {
        undoStack.value.shift();
      }
      applySnapshot(redoStack.value.pop()!);
    };
    const setFocusMode = (value: boolean) => {
      focusMode.value = value;
    };
    const setGenerating = (val: boolean) => {
      isGenerating.value = val;
    };
    const mergeResumeItem = (item: any) => merge(structuredClone(DEFAULT_RESUME_ITEM), item);

    // 从目录读取简历索引并加载对应的完整简历
    const init = () => {
      if (initPromise) return initPromise;
      initPromise = (async () => {
        system.value = merge(structuredClone(DEFAULT_SYSTEM), system.value);
        const items = await loadResumeItems(list.value.map((item) => item.id));
        const itemIds = new Set(items.map((item) => item.id));
        list.value = list.value.filter((item) => itemIds.has(item.id));
        resumeRecords.value = items;
      })();
      return initPromise;
    };

    // 内容快照：编辑停顿后基于实时数据生成的只读副本，供预览测量树等派生逻辑读取
    const contentSnapshot = shallowRef<any>(null);
    const refreshContentSnapshot = () => {
      const item = currentItem.value;
      contentSnapshot.value = item?.data ? deepClone(item.data) : null;
    };
    // 内容变更脉冲：整份简历任一嵌套字段变化后自增，供派生逻辑在编辑停顿后统一刷新
    const contentVersion = ref(0);
    // 是否处于编辑中：内容变化后置真，停顿 EDIT_IDLE_DELAY 后置否
    const isEditing = ref(false);
    const EDIT_IDLE_DELAY = 400;
    const markEditingIdle = debounce(() => (isEditing.value = false), EDIT_IDLE_DELAY);
    // 唯一的简历内容变更来源：整份 currentItem 的 data/config/ui 任一嵌套字段变化都收敛到这里
    watch(
      () => currentItem.value,
      (item) => {
        // 广播变更脉冲后由各派生逻辑统一订阅处理
        contentVersion.value += 1;
        isEditing.value = true;
        markEditingIdle();
        // 无选中简历时只广播，不落库也不入历史
        if (!item) return;
        // 内容变化写回 IndexedDB（内部防抖合并连续编辑）
        schedulePersistResume(item);
        // 历史开关关闭时暂停记录（初始化、同步及离开编辑器期间的变更不入历史）
        if (!historyEnabled.value) return;
        // 撤销/重做恢复触发的变化：消费标志并跳过，避免恢复动作又入栈
        if (skipNextWatch) {
          skipNextWatch = false;
          return;
        }
        // 尚未建立基准快照时忽略
        if (!lastSnapshot) return;
        // 防抖记录历史：序列化比较与深拷贝延迟到停顿后统一执行
        recordHistory(item);
      },
      { deep: true },
    );
    // 切换简历后立即重建内容快照，避免进入编辑器时预览测量树读到空数据
    watch(currentIndex, refreshContentSnapshot, { immediate: true });
    // 编辑停顿后重建内容快照：预览测量树在此时统一刷新
    watch(isEditing, (editing) => {
      if (!editing) refreshContentSnapshot();
    });
    // 切换简历时：取消防抖等待中的历史、清空历史栈并重置基准快照
    watch(currentIndex, () => {
      resetHistoryBase();
    });

    return {
      list,
      resumeList,
      trashList,
      maxCount,
      currentIndex,
      editorWidth,
      focusMode,
      desensitizeMode,
      isGenerating,
      setGenerating,
      system,
      itemDefaultCollapsed,
      initResumeStatus,
      applyResumeOperations,
      restoreConfig,
      getModel,
      currentItem,
      currentData,
      currentConfig,
      runtimeConfig,
      runtimeFields,
      currentUI,
      currentUsage,
      isPrinting,
      beginPrinting,
      cancelPrinting,
      finishPrinting,
      isFittingOnePage,
      beginFittingOnePage,
      cancelFittingOnePage,
      finishFittingOnePage,
      selectedModule,
      selectModule,
      unselectModule,
      clearSelectedModules,
      setSelectedModules,
      setModuleHidden,
      setModuleArchived,
      removeModule,
      swapModuleOrder,
      setPageLayout,
      addResume,
      duplicateResume,
      deleteResume,
      restoreResume,
      permanentlyDeleteResume,
      clearTrash,
      cleanExpiredTrash,
      getTrashRemainingDays,
      updateResumeAiChatSummary,
      clearResumeAiChatSummaries,
      maxTrashCount,
      trashRetentionDays,
      setFocusMode,
      undo,
      redo,
      undoStack,
      redoStack,
      resetHistoryBase,
      enableHistory,
      disableHistory,
      init,
      configSyncing,
      setConfigSyncing,
      previewSyncing,
      setPreviewSyncing,
      runtimeData,
      contentVersion,
      isEditing,
      contentSnapshot,
      resetSettings,
    };
  },
  {
    persist: {
      pick: ["list", "editorWidth", "system", "desensitizeMode"],
    },
  },
);
