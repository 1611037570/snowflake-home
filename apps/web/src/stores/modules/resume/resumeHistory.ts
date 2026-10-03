import { debounce } from "lodash-es";
import { computed, ref, type ComputedRef } from "vue";
import {
  collectMediaBindings,
  getValueAtPath,
  isMediaMark,
  mediaMark,
} from "./config/mediaFields";

type ResumeHistoryOptions = {
  currentItem: ComputedRef<any>;
  refreshRuntime: () => void;
};

// 快照捕获结果：字符串承载文本与结构，媒体由媒体池按占位标识另行保存
type SnapshotCapture = {
  /** 序列化后的快照字符串，媒体字段已替换为占位标识 */
  snapshot: string;
  /** 内容比较标记：媒体占位是常量，必须并入媒体本身参与比较，否则纯换图不会被判定为内容变化 */
  compare: string;
  /** 本次媒体占位到 base64 的对应关系，仅包含尚未入池的部分 */
  mediaEntries: Map<string, string>;
};

export const createResumeHistory = ({ currentItem, refreshRuntime }: ResumeHistoryOptions) => {
  // 已提交版本序列：撤销的唯一真源，末项为当前内容
  const versions = ref<SnapshotCapture[]>([]);
  // 撤销后离开的版本序列：按撤销顺序保存，末项为最近一次撤销离开的版本
  const redoVersions = ref<SnapshotCapture[]>([]);
  // 对外暴露的栈内容仅供界面判断可撤销/可重做，派生自上述序列
  const undoStack = computed(() => versions.value.map(toStackEntry));
  const redoStack = computed(() => redoVersions.value.map(toStackEntry));
  // 媒体池：按占位标识保存 base64，同一张图被多份快照引用时只存一份
  const mediaPool = new Map<string, string>();
  const maxHistory = 12;
  let skipNextWatch = false;
  // 上一份快照及其媒体：撤销时据此还原媒体，避免撤销文字编辑时丢掉媒体
  let lastCapture: SnapshotCapture | null = null;
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
  // 把媒体替换为占位标识：按声明路径定界，不依赖字段名是否唯一
  const stripMedia = (data: any, mediaEntries: Map<string, string>) => {
    // 显式 JSON 往返：structuredClone 无法克隆响应式代理，且 config 可能带有运行时函数值
    const clone = JSON.parse(JSON.stringify(data ?? {}));
    collectMediaBindings(clone).forEach((binding) => {
      const held = getValueAtPath(clone, binding.path);
      if (!held || typeof held !== "object") return;
      const value = held[binding.field];
      // 空值同样要留占位：撤销删除媒体时需要知道当时没有媒体，避免把当前值贴回
      const text = value ? String(value) : "";
      const mark = text ? mediaMark(binding.field, binding.path, text) : "";
      // 清单记录该版本媒体的完整映射（含已在池中的项），媒体池回收时才不会误删仍被引用的图片
      if (mark) mediaEntries.set(mark, text);
      held[binding.field] = mark;
    });
    return clone;
  };
  // 内容比较标记：媒体占位本身恒定，必须并入媒体内容参与比较，否则纯换图不会被判定为内容变化
  const buildCompare = (data: any, config: any, ui: any, mediaEntries: Map<string, string>) =>
    JSON.stringify([
      data,
      removeRuntimeIds(config),
      ui,
      [...mediaEntries.keys()],
      [...mediaEntries.values()],
    ]);
  // 总在媒体入池前捕获：先取占位版本，再写入池，保证撤销/重做两侧的媒体都登记在池中
  const captureCore = (item: any): SnapshotCapture => {
    const mediaEntries = new Map<string, string>();
    if (!item) return { snapshot: "", compare: "", mediaEntries };
    const data = stripMedia(item.data, mediaEntries);
    return {
      // 入栈内容只保留文本与结构，撤销时解析还原，避免深拷贝整份简历
      snapshot: JSON.stringify({
        data,
        config: removeRuntimeIds(item.config),
        ui: item.ui,
      }),
      compare: buildCompare(data, item.config, item.ui, mediaEntries),
      mediaEntries,
    };
  };
  // 登记媒体：快照字符串入栈时才写池，快照被容量淘汰后不影响仍被引用图片的还原
  const commitMedia = (capture: SnapshotCapture) => {
    capture.mediaEntries.forEach((value, mark) => {
      if (!mediaPool.has(mark)) mediaPool.set(mark, value);
    });
  };
  const capture = (item: any) => {
    const result = captureCore(item);
    commitMedia(result);
    return result;
  };
  // 媒体占位还原为真实值：标识命中媒体池取原值，空占位表示当时无媒体
  const restoreMedia = (data: any) => {
    collectMediaBindings(data).forEach((binding) => {
      const held = getValueAtPath(data, binding.path);
      if (!held || typeof held !== "object") return;
      const value = held[binding.field];
      if (isMediaMark(value)) {
        // 媒体池缺失该标识时清空，避免把占位标识写回业务数据
        held[binding.field] = mediaPool.get(value) ?? "";
        return;
      }
      // 旧版快照直接存有真实媒体：保留原值
      held[binding.field] = value ?? "";
    });
    return data;
  };
  // 历史栈元素：快照字符串入栈前先补齐媒体池，避免占位标识无法还原
  const toStackEntry = (capture: SnapshotCapture) => {
    commitMedia(capture);
    return capture.snapshot;
  };
  // 回收媒体池：只保留仍被撤销/重做序列引用的媒体，换图产生的旧版本在淘汰后不再占用内存
  const pruneMediaPool = () => {
    const alive = new Set<string>();
    [...versions.value, ...redoVersions.value].forEach((capture) => {
      capture.mediaEntries.forEach((_value, mark) => alive.add(mark));
    });
    [...mediaPool.keys()].forEach((mark) => {
      if (!alive.has(mark)) mediaPool.delete(mark);
    });
  };
  // 追加已提交版本：入栈前先补齐媒体池，保证该版本的占位标识都能还原
  const commitVersion = (capture: SnapshotCapture) => {
    commitMedia(capture);
    versions.value.push(capture);
    if (versions.value.length > maxHistory) versions.value.shift();
    pruneMediaPool();
  };
  // 记录一次编辑产生的版本：内容未变化时不入栈，新编辑同时清空重做序列
  const pushCapture = (capture: SnapshotCapture, resumeId: string) => {
    const item = currentItem.value;
    // 已切换简历则丢弃本次历史（避免旧简历内容记入新简历）
    if (!item || !capture?.snapshot || item.id !== resumeId) return;
    if (capture.compare === versions.value[versions.value.length - 1]?.compare) return;
    commitVersion(capture);
    redoVersions.value = [];
  };
  // 媒体入池随有效版本一起防抖提交：合并连续输入，未产生新版本时不写入媒体池
  const pushHistory = debounce(pushCapture, 100);
  const recordHistory = debounce((item: any) => {
    if (!item) return;
    if (item.id !== currentItem.value?.id) return;
    const nextCapture = captureCore(item);
    // 与最新提交版本一致时不记录，避免 usage 时间戳等无关变化入栈
    if (nextCapture.compare === lastCapture?.compare) return;
    // 当前内容成为最新版本
    pushHistory(nextCapture, item.id);
    lastCapture = nextCapture;
  }, 300);
  const onContentChange = (item: any) => {
    if (!historyEnabled.value) return;
    if (skipNextWatch) {
      skipNextWatch = false;
      return;
    }
    if (!lastCapture) return;
    recordHistory(item);
  };
  // 开启历史时把当前内容作为基线版本入栈，否则首次编辑后没有可撤销的目标
  const seedBaseline = () => {
    const baseline = captureCore(currentItem.value);
    if (baseline.snapshot) commitVersion(baseline);
    return baseline;
  };
  const resetHistoryBase = () => {
    recordHistory.cancel();
    pushHistory.cancel();
    versions.value = [];
    redoVersions.value = [];
    mediaPool.clear();
    lastCapture = seedBaseline();
  };
  const enableHistory = () => {
    recordHistory.cancel();
    pushHistory.cancel();
    lastCapture = seedBaseline();
    historyEnabled.value = true;
  };
  const disableHistory = () => {
    recordHistory.cancel();
    pushHistory.cancel();
    versions.value = [];
    redoVersions.value = [];
    mediaPool.clear();
    lastCapture = null;
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
    item.data = restoreMedia(snapItem.data ?? {});
    item.config = snapItem.config;
    item.ui = snapItem.ui;
    lastCapture = capture(item);
    if (configChanged) refreshRuntime();
  };
  // 撤销/重做前把当前内容登记为最新版本：它是反方向操作要回到的状态
  // 与栈顶一致时不重复入栈，否则随后的 pop 只会弹掉这份副本，导致撤销原地不动
  const registerCurrent = (item: any) => {
    const current = capture(item);
    if (current.compare !== versions.value[versions.value.length - 1]?.compare) {
      commitVersion(current);
    }
    return current;
  };
  const undo = () => {
    recordHistory.flush();
    pushHistory.flush();
    const item = currentItem.value;
    if (!item || versions.value.length === 0) return;
    registerCurrent(item);
    const current = versions.value.pop();
    // 没有更早版本时保持原状，避免一次空撤销
    if (!current || versions.value.length === 0) {
      if (current) versions.value.push(current);
      return;
    }
    // 媒体先随版本入池，再移入重做序列，避免池回收把刚离开的版本媒体删掉
    commitMedia(current);
    redoVersions.value.push(current);
    if (redoVersions.value.length > maxHistory) redoVersions.value.shift();
    // 弹出当前版本后，栈顶即上一次编辑的状态
    const previous = versions.value[versions.value.length - 1];
    if (!previous) return;
    applySnapshot(previous.snapshot);
    pruneMediaPool();
  };
  const redo = () => {
    recordHistory.flush();
    pushHistory.flush();
    const item = currentItem.value;
    if (!item || redoVersions.value.length === 0) return;
    // 先登记媒体再弹出重做项，媒体池才会保留该版本的图片
    const next = redoVersions.value[redoVersions.value.length - 1];
    if (!next) return;
    commitMedia(next);
    redoVersions.value.pop();
    registerCurrent(item);
    applySnapshot(next.snapshot);
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
