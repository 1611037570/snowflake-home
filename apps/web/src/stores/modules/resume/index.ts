import confirm from "@/components/business/confirm";
import { ElMessage } from "element-plus";
import router from "@/routers";
import { useAiStore } from "@/stores/modules/ai";
import { defineStore } from "pinia";
import { useEventListener } from "@vueuse/core";
import { computed, nextTick, ref, toRaw, watch } from "vue";
import { DEFAULT_RESUME_ITEM, DEFAULT_EDITOR, DEFAULT_SYSTEM } from "./config/defaultConfig";
import { COLLAPSED, EXPANDED } from "./config/formConfig";
import { debounce, merge } from "lodash-es";
import { createResumeStorage } from "./resumeStorage";
import { createResumeLifecycle } from "./resumeLifecycle";
import { createResumeEditor } from "./resumeEditor";
import { createResumeHistory } from "./resumeHistory";
import { createResumeRuntime } from "./resumeRuntime";
import type { ResumeListItem } from "./resumeCatalog";
import { createResumeListItem } from "./resumeCatalog";
import { loadResumeTemplateData } from "@/views/resume/template/data/resumeData";
import { compactResumeUi, resolveResumeUi } from "@/domain/resume/theme/resumeUi";
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
    const { getResumeStorage, loadResumeItems, removeResumeStorage, schedulePersistResume, flushPersistResume, saveStates } =
      createResumeStorage();
    let initPromise: Promise<void> | null = null;
    const resumeLoadPromises = new Map<string, Promise<any>>();
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
    // AI 请求脱敏配置：禁用时不脱敏，否则按等级过滤敏感字段
    const desensitizeMode = ref<DesensitizeConfig>({
      disabled: true,
      level: "normal",
    });
    // 系统配置
    const system = ref(structuredClone(DEFAULT_SYSTEM));
    // 新增记录的默认折叠状态：由系统设置统一决定
    const itemDefaultCollapsed = computed(() =>
      system.value.defaultItemExpanded ? EXPANDED : COLLAPSED,
    );
    // 当前选中的简历项
    const currentItem = computed(() => resumeList.value[currentIndex.value]);

    // 获取当前选中的简历数据
    const currentData = computed(() => {
      const item = currentItem.value;
      return item ? item.data : undefined;
    });

    const editor = createResumeEditor({ currentItem, currentData, itemDefaultCollapsed });
    const {
      currentConfig,
      runtimeConfig,
      runtimeFields,
      setConfigModules,
      addModule,
      restoreConfig,
      currentUI,
      currentUsage,
      selectedModule,
      getModel,
      selectModule,
      unselectModule,
      clearSelectedModules,
      setSelectedModules,
      setModuleHidden,
      removeModule,
      setLayoutColumns,
      swapModuleOrder,
      applyResumeOperations,
    } = editor;
    const runtime = createResumeRuntime({ clearSelectedModules });
    const {
      focusMode,
      editingModuleKey,
      isPrinting,
      beginPrinting,
      cancelPrinting,
      finishPrinting,
      isFittingOnePage,
      beginFittingOnePage,
      cancelFittingOnePage,
      finishFittingOnePage,
      isGenerating,
      setGenerating,
      configSyncing,
      setConfigSyncing,
      previewSyncing,
      setPreviewSyncing,
      runtimeData,
      setFocusMode,
      initResumeStatus,
    } = runtime;
    const history = createResumeHistory({ currentItem, refreshRuntime: editor.refreshRuntime });
    const {
      undoStack,
      redoStack,
      onContentChange,
      resetHistoryBase,
      enableHistory,
      disableHistory,
      undo,
      redo,
    } = history;
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
    const lifecycle = createResumeLifecycle({
      list,
      resumeRecords,
      resumeList,
      trashList,
      currentIndex,
      maxCount,
      maxTrashCount,
      trashRetentionMs,
      defaultResumeItem: DEFAULT_RESUME_ITEM,
      getResumeStorage,
      removeResumeStorage,
      setConfigModules,
      deepClone,
      clearCurrentAssistantChat: (resumeId) =>
        useAiStore().clearCurrentResumeAssistantChat(resumeId),
      removeAssistantChats: (resumeId) => useAiStore().removeResumeAssistantChats(resumeId),
      onResumeLimit: () => {
        confirm(`请前往我的简历管理删除后再新建。`, "容量已满").then(() => {
          router.push("/resume/mine");
        });
      },
      onTrashLimit: () => confirm("回收站已满，请先清理回收站后再删除。", "回收站已满"),
      onRestoreLimit: () => ElMessage.warning(`简历数量已达到上限（${maxCount}个），请先删除其他简历。`),
      navigateToEditor: (resumeId) =>
        router.push({ path: "/resume/editor", query: { id: resumeId } }),
    });
    const {
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
    } = lifecycle;
    // 重置所有设置为默认值
    const resetSettings = () => {
      system.value = structuredClone(DEFAULT_SYSTEM);
    };
    // 初始化系统设置，不读取未使用的简历正文
    const init = () => {
      if (initPromise) return initPromise;
      initPromise = (async () => {
        system.value = merge(structuredClone(DEFAULT_SYSTEM), system.value);
      })();
      return initPromise;
    };
    const loadResumeRecord = async (id: string) => {
      const existing = resumeRecords.value.find((item) => item.id === id);
      if (existing) return existing;
      const pending = resumeLoadPromises.get(id);
      if (pending) return pending;
      const loading = loadResumeItems([id])
        .then(([item]) => {
          if (!item) {
            list.value = list.value.filter((entry) => entry.id !== id);
            return null;
          }
          const records = new Map(resumeRecords.value.map((record) => [record.id, record]));
          records.set(id, item);
          // 懒加载只追加缺失记录，保持已加载简历的下标，避免当前编辑对象被目录排序替换
          resumeRecords.value = [...records.values()].filter((record) =>
            list.value.some((entry) => entry.id === record.id),
          );
          return item;
        })
        .finally(() => resumeLoadPromises.delete(id));
      resumeLoadPromises.set(id, loading);
      return loading;
    };
    const loadResume = async (id: string) => {
      await init();
      // 固定的小羊简历地址首次访问时，从内置范本建立可编辑的本地简历。
      if (id === "xiaoyang" && !list.value.some((item) => item.id === id)) {
        const template = await loadResumeTemplateData("xiaoYang.ts");
        const resume = merge(structuredClone(DEFAULT_RESUME_ITEM), template);
        resume.id = id;
        resume.ui = resolveResumeUi(compactResumeUi(template.ui));
        setConfigModules(resume, resume.config.modules);
        const storage = getResumeStorage(id, resume, true);
        resumeRecords.value.push(storage.data.value);
        list.value.unshift(createResumeListItem(id));
      }
      const entry = list.value.find((item) => item.id === id && item.deletedAt === null);
      return entry ? loadResumeRecord(id) : null;
    };
    const loadActiveResumes = async () => {
      await init();
      await Promise.all(
        list.value.filter((item) => item.deletedAt === null).map((item) => loadResumeRecord(item.id)),
      );
      return resumeList.value;
    };
    const loadTrashResumes = async () => {
      await init();
      await Promise.all(
        list.value.filter((item) => item.deletedAt !== null).map((item) => loadResumeRecord(item.id)),
      );
      return trashList.value;
    };

    // 按简历编号保存标题，列表中重命名非当前简历时也能正确持久化。
    const renameResume = (id: string, titleMode: "auto" | "custom", customTitle: string) => {
      const item = resumeRecords.value.find((record) => record.id === id);
      if (!item) return false;
      item.usage.titleMode = titleMode;
      item.usage.customTitle = customTitle;
      schedulePersistResume(item);
      return true;
    };

    // 内容变更脉冲：整份简历任一嵌套字段变化后自增，供派生逻辑在编辑停顿后统一刷新
    const contentVersion = ref(0);
    // 是否处于编辑中：内容变化后置真，停顿 EDIT_IDLE_DELAY 后置否
    const isEditing = ref(false);
    const EDIT_IDLE_DELAY = 200;
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
        onContentChange(item);
      },
      { deep: true },
    );
    // 显式保存先等待本轮内容监听入队，再等待数据库事务。
    const savePendingResumes = async () => { await nextTick(); await flushPersistResume(); };
    const flushOnHidden = () => {
      if (document.visibilityState === "hidden") void savePendingResumes().catch(() => {});
    };
    useEventListener(document, "visibilitychange", flushOnHidden);
    useEventListener(window, "pagehide", () => { void savePendingResumes().catch(() => {}); });
    // 切换简历时：取消防抖等待中的历史、清空历史栈并重置基准快照
    watch(currentIndex, () => {
      resetHistoryBase();
    });

    return {
      list,
      saveStates, // 各简历实际保存阶段与失败说明
      savePendingResumes, // 可等待并向调用方报告失败的保存入口
      resumeList,
      renameResume, // 按编号重命名并保存简历
      trashList,
      maxCount,
      currentIndex,
      editorWidth,
      focusMode,
      editingModuleKey, // 当前编辑模块标识，仅用于会话内预览提示。
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
      addModule, // 预设模块统一经编辑器运行时配置展开。
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
      removeModule,
      swapModuleOrder,
      setLayoutColumns,
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
      loadResume,
      loadActiveResumes,
      loadTrashResumes,
      configSyncing,
      setConfigSyncing,
      previewSyncing,
      setPreviewSyncing,
      runtimeData,
      contentVersion,
      isEditing,
      resetSettings,
    };
  },
  {
    persist: {
      pick: ["list", "editorWidth", "system", "desensitizeMode"],
    },
  },
);
