import { debounce } from "lodash-es";
import { ref, type ComputedRef } from "vue";

type ResumeHistoryOptions = {
  currentItem: ComputedRef<any>;
  refreshRuntime: () => void;
};

export const createResumeHistory = ({ currentItem, refreshRuntime }: ResumeHistoryOptions) => {
  const undoStack = ref<string[]>([]);
  const redoStack = ref<string[]>([]);
  const maxHistory = 12;
  let skipNextWatch = false;
  let lastSnapshot: string | null = null;
  const historyEnabled = ref(false);

  const removeRuntimeIds = (value: any): any => {
    if (Array.isArray(value)) return value.map(removeRuntimeIds);
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value)
          .filter(([key]) => key !== "id")
          .map(([key, item]) => [key, removeRuntimeIds(item)]),
      );
    }
    return value;
  };
  const serializeForCompare = (item: any) => {
    if (!item) return "";
    return JSON.stringify({
      data: item.data,
      config: removeRuntimeIds(item.config),
      ui: item.ui,
    });
  };
  const pushHistory = debounce((snapshot: string, resumeId: string) => {
    const item = currentItem.value;
    // 已切换简历则丢弃本次历史（避免旧简历内容记入新简历）
    if (!item || !snapshot || item.id !== resumeId) return;
    // 与栈顶内容相同则不重复记录
    if (undoStack.value[undoStack.value.length - 1] === snapshot) return;
    // 入栈内容快照字符串，撤销时解析还原，避免深拷贝整份简历
    undoStack.value.push(snapshot);
    if (undoStack.value.length > maxHistory) undoStack.value.shift();
    redoStack.value = [];
  }, 100);
  const recordHistory = debounce((item: any) => {
    const snapshot = serializeForCompare(item);
    // 内容相对上次快照有变化才记录一条历史，避免 usage 时间戳等无关变化入栈
    if (snapshot === lastSnapshot) return;
    pushHistory(lastSnapshot!, item?.id);
    lastSnapshot = snapshot;
  }, 300);
  const onContentChange = (item: any) => {
    if (!historyEnabled.value) return;
    if (skipNextWatch) {
      skipNextWatch = false;
      return;
    }
    if (!lastSnapshot) return;
    recordHistory(item);
  };
  const resetHistoryBase = () => {
    recordHistory.cancel();
    pushHistory.cancel();
    undoStack.value = [];
    redoStack.value = [];
    lastSnapshot = currentItem.value ? serializeForCompare(currentItem.value) : null;
  };
  const enableHistory = () => {
    recordHistory.cancel();
    pushHistory.cancel();
    lastSnapshot = currentItem.value ? serializeForCompare(currentItem.value) : null;
    historyEnabled.value = true;
  };
  const disableHistory = () => {
    recordHistory.cancel();
    pushHistory.cancel();
    undoStack.value = [];
    redoStack.value = [];
    lastSnapshot = null;
    historyEnabled.value = false;
  };
  const applySnapshot = (snapshot: string) => {
    const item = currentItem.value;
    if (!item) return;
    const snapItem = JSON.parse(snapshot);
    // 模块配置是否变化：仅增删模块或调整顺序时才需要重建运行时配置（重建会重排表单 key 导致整表重建）
    const configChanged =
      JSON.stringify(removeRuntimeIds(item.config)) !== JSON.stringify(snapItem.config);
    skipNextWatch = true;
    item.data = snapItem.data;
    item.config = snapItem.config;
    item.ui = snapItem.ui;
    lastSnapshot = serializeForCompare(item);
    if (configChanged) refreshRuntime();
  };
  const undo = () => {
    recordHistory.flush();
    pushHistory.flush();
    const item = currentItem.value;
    if (!item || undoStack.value.length === 0) return;
    redoStack.value.push(serializeForCompare(item));
    if (redoStack.value.length > maxHistory) redoStack.value.shift();
    applySnapshot(undoStack.value.pop()!);
  };
  const redo = () => {
    recordHistory.flush();
    pushHistory.flush();
    const item = currentItem.value;
    if (!item || redoStack.value.length === 0) return;
    undoStack.value.push(serializeForCompare(item));
    if (undoStack.value.length > maxHistory) undoStack.value.shift();
    applySnapshot(redoStack.value.pop()!);
  };

  return {
    undoStack,
    redoStack,
    historyEnabled,
    onContentChange,
    resetHistoryBase,
    enableHistory,
    disableHistory,
    undo,
    redo,
  };
};
