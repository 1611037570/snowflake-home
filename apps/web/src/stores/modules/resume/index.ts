import confirm from "@/components/business/confirm";
import router from "@/routers";
import { getUUID } from "@/utils";
import { defineStore } from "pinia";
import { computed, ref, toRaw, watch } from "vue";
import { ALL_MODULE_KEY, DEFAULT_MODULE_NAMES, DEFAULT_RESUME_ITEM, DEFAULT_SYSTEM } from "./defaultConfig";
import type { SelectedModule } from "./types";
import { useRefreshConfigByData } from "./hooks/useRefreshConfigByData";
import { createRecordSkeleton } from "./hooks/useAddRecord";

import { debounce, merge } from "lodash-es";
export type ResumeLayout = "list" | "three" | "ai";

export const useResumeStore = defineStore(
  "resume",
  () => {
    // 简历列表
    const list = ref<any[]>([]);
    // 回收站列表
    const trashList = ref<any[]>([]);
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
    // 当前布局
    const layout = ref<ResumeLayout>("three");
    // 专注写作模式（临时状态，不持久化）
    const focusMode = ref(false);
    // 是否正在打印
    const isPrinting = ref(false);
    // 是否AI生成中
    const isGenerating = ref(false);
    // 撤销历史栈：每个元素为 { _s: 内容序列化(用于去重), item: 修改前的完整深拷贝快照 }
    const undoStack = ref<any[]>([]);
    // 重做历史栈：结构与撤销栈相同
    const redoStack = ref<any[]>([]);
    // 撤销历史最大条数
    const maxHistory = 12;
    // 恢复快照时跳过下次监听的标志（撤销/重做触发的响应式变化不应再入栈）
    let skipNextWatch = false;
    // 上一次的完整内容快照（深拷贝），作为撤销历史基准：每次内容变化时把这份基准入栈
    let lastSnapshot: any = null;
    // 历史记录开关：仅在编辑器初始化完成后由 Builder 开启，离开编辑器时关闭
    const historyEnabled = ref(false);
    // 系统配置
    const system = ref(structuredClone(DEFAULT_SYSTEM));
    // 初始化状态
    function initResumeStatus() {
      // 重置打印状态
      isPrinting.value = false;
      // 重置AI生成状态
      isGenerating.value = false;
      // 重置选中模块
      selectedModule.value = [];
    }
    // 当前选中的简历项
    const currentItem = computed(() => list.value[currentIndex.value]);

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
    // 获取当前选中的固定配置
    const currentFixedConfig = computed({
      get() {
        const item = currentItem.value;
        return item ? item.fixedConfig : undefined;
      },
      set(newFixedConfig: any) {
        const item = currentItem.value;
        if (item) {
          item.fixedConfig = newFixedConfig;
        }
      },
    });
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
    const selectedModule = ref<SelectedModule[]>([]);
    // 获取模块名称
    const getModel = (key: string): SelectedModule | undefined => {
      if (!key) return;
      if (key.startsWith("custom")) {
        return {
          key,
          name: currentData.value?.[key]?.name || "",
        };
      }
      const found = DEFAULT_MODULE_NAMES.find((item) => item.key === key);
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
    const setSelectedModules = (modules: SelectedModule[]) => {
      selectedModule.value = modules;
    };
    // 添加选中模块：兼容旧入口
    const pushSelectedModule = (key: string) => {
      selectModule(key);
    };
    // 新增简历：jump 控制是否跳转编辑器，导入场景传 false 仅创建不跳转；返回是否新增成功
    const addResume = (config: any, jump = true) => {
      if (list.value.length >= maxCount) {
        confirm(`请前往我的简历管理删除后再新建。`, "容量已满").then(() => {
          router.push("/resume/mine");
        });
        return false;
      }
      const res = config ? mergeResumeItem(config) : structuredClone(DEFAULT_RESUME_ITEM);
      // 每次新增都重新生成唯一ID，避免多份简历共用一个ID
      res.id = getUUID().slice(0, 6);
      list.value.push(res);
      currentIndex.value = list.value.length - 1;
      if (jump) router.push({ path: "/resumeEditor", query: { id: res.id } });
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
    // 简历表单配置同步：按当前简历 data 刷新最新默认配置并补齐数组子项
    const { refreshConfigByData } = useRefreshConfigByData();
    // 自动同步后对齐撤销基准快照，避免自动同步产生撤销历史
    function syncConfigByData() {
      // 记录配置同步耗时，便于排查性能问题
      const startTime = performance.now();
      const item = currentItem.value;
      const changed = refreshConfigByData(item);
      if (changed) lastSnapshot = deepClone(item);
      console.log(`简历配置同步耗时：${(performance.now() - startTime).toFixed(2)}ms`);
    }
    // 数组型模块新增记录：落一条含字段的空记录骨架并同步表单配置，返回新记录下标
    function addDataRecord(moduleKey: string): number {
      const data = currentData.value;
      const module = data?.[moduleKey];
      if (!module || !Array.isArray(module.data)) return -1;
      module.data.push(createRecordSkeleton(moduleKey));
      syncConfigByData();
      return module.data.length - 1;
    }
    // AI 直接写入：把语义化 patch 递归应用到真实简历数据，不再经过预览草稿
    function applyAiDataPatch(patch: Record<string, any>): string[] {
      const data = currentData.value;
      if (!data || !patch || typeof patch !== "object") return [];
      const changedPaths: string[] = [];
      const isPlainObject = (value: any) =>
        value !== null && typeof value === "object" && !Array.isArray(value);
      const isObjectArray = (value: any) =>
        Array.isArray(value) && value.some((item) => isPlainObject(item));
      const sameValue = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);
      const write = (src: any, node: any, parent: string) => {
        if (!isPlainObject(node)) return;
        Object.keys(node).forEach((key) => {
          if (!src || !(key in src)) return;
          const srcVal = src[key];
          const patchVal = node[key];
          const path = parent ? `${parent}.${key}` : key;
          if (isObjectArray(srcVal) && isObjectArray(patchVal)) {
            srcVal.forEach((item: any, idx: number) => {
              if (patchVal[idx]) write(item, patchVal[idx], `${path}.${idx}`);
            });
            return;
          }
          if (isPlainObject(srcVal) && isPlainObject(patchVal)) {
            write(srcVal, patchVal, path);
            return;
          }
          if (patchVal !== undefined && !sameValue(patchVal, srcVal)) {
            src[key] = patchVal;
            changedPaths.push(path);
          }
        });
      };
      write(data, patch, "");
      return changedPaths;
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
      // 深拷贝一份移入回收站，标记删除时间
      const deletedItem = deepClone(list.value[currentIndex.value]);
      deletedItem._deletedAt = Date.now();
      trashList.value.push(deletedItem);
      list.value.splice(currentIndex.value, 1);
      currentIndex.value = -1;
    };
    // 从回收站恢复简历
    const restoreResume = (trashIndex: number) => {
      if (trashIndex < 0 || trashIndex >= trashList.value.length) return;
      const item = trashList.value[trashIndex];
      delete item._deletedAt;
      list.value.push(item);
      trashList.value.splice(trashIndex, 1);
    };
    // 永久删除回收站中的简历
    const permanentlyDeleteResume = (trashIndex: number) => {
      if (trashIndex < 0 || trashIndex >= trashList.value.length) return;
      trashList.value.splice(trashIndex, 1);
    };
    // 清理回收站中超过保留天数的简历（每次进入简历页时调用）
    const cleanExpiredTrash = () => {
      const now = Date.now();
      trashList.value = trashList.value.filter((item) => {
        const deletedAt = item?._deletedAt || 0;
        return now - deletedAt < trashRetentionMs;
      });
    };
    // 计算回收站简历剩余保留天数（0 表示即将清理）
    const getTrashRemainingDays = (item: any) => {
      const deletedAt = item?._deletedAt || 0;
      if (!deletedAt) return 0;
      const remaining = trashRetentionMs - (Date.now() - deletedAt);
      return remaining <= 0 ? 0 : Math.ceil(remaining / (24 * 60 * 60 * 1000));
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
        fixedConfig: removeRuntimeIds(item.fixedConfig),
        ui: item.ui,
      });
    };
    // 防抖写入撤销历史：把 300ms 内的连续编辑合并为一条，防抖到期后才真正入栈
    const pushHistory = debounce((oldItem: any) => {
      const item = currentItem.value;
      // 已切换简历则丢弃本次历史（避免旧简历内容记入新简历）
      if (!item || !oldItem || oldItem.id !== item.id) return;
      const serialized = serializeForCompare(oldItem);
      const top = undoStack.value[undoStack.value.length - 1];
      // 与栈顶内容相同则不重复记录
      if (top && top._s === serialized) return;
      // 入栈：_s 用于去重，item 为修改前的完整快照（structuredClone 独立拷贝）
      undoStack.value.push({ _s: serialized, item: structuredClone(oldItem) });
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
    // 防抖记录历史：连续编辑合并为一条，防抖到期后才执行全量序列化比较与基准快照深拷贝，避免每次按键同步执行重开销
    const recordHistory = debounce((item: any) => {
      // 内容相对上次快照有变化才记录一条历史，避免 usage 时间戳等无关变化入栈
      if (serializeForCompare(item) !== serializeForCompare(lastSnapshot)) {
        // 将修改前的状态作为历史（防抖合并后入栈）
        pushHistory(lastSnapshot);
        // 更新基准快照为当前内容，作为下次变化时的"修改前状态"
        lastSnapshot = deepClone(item);
      }
    }, 300);
    // 重置历史基准：取消防抖、清空历史栈并对齐当前简历快照（编辑器初始化完成后调用）
    const resetHistoryBase = () => {
      recordHistory.cancel();
      pushHistory.cancel();
      undoStack.value = [];
      redoStack.value = [];
      lastSnapshot = currentItem.value ? deepClone(currentItem.value) : null;
    };
    // 开启历史记录：取消防抖等待并对齐当前简历快照（由 Builder 在同步完成后调用）
    const enableHistory = () => {
      recordHistory.cancel();
      pushHistory.cancel();
      lastSnapshot = currentItem.value ? deepClone(currentItem.value) : null;
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
    // 应用历史快照：只恢复内容字段（data/config/fixedConfig/ui），保留 id 与 usage
    const applySnapshot = (snapItem: any) => {
      const item = currentItem.value;
      if (!item) return;
      // 恢复引发的响应式变化不应被记为新的历史，跳过下一次监听
      skipNextWatch = true;
      item.data = snapItem.data;
      item.config = snapItem.config;
      item.fixedConfig = snapItem.fixedConfig;
      item.ui = snapItem.ui;
      // 恢复后同步基准快照，保证下次编辑以恢复后的状态为历史基准
      lastSnapshot = deepClone(item);
    };
    // 撤回：当前状态入重做栈，再恢复撤销栈顶的修改前状态
    const undo = () => {
      // 先落库防抖等待中的历史，保证编辑后立即撤回也能生效
      recordHistory.flush();
      pushHistory.flush();
      const item = currentItem.value;
      if (!item || undoStack.value.length === 0) return;
      // 当前状态保存进重做栈，供"前进"恢复
      redoStack.value.push({ _s: serializeForCompare(item), item: deepClone(item) });
      if (redoStack.value.length > maxHistory) {
        redoStack.value.shift();
      }
      // 弹出并恢复最近一条历史快照
      applySnapshot(undoStack.value.pop().item);
    };
    // 重做：与撤回对称，恢复重做栈顶的快照
    const redo = () => {
      // 先落库防抖等待中的历史，保证操作顺序一致
      recordHistory.flush();
      pushHistory.flush();
      const item = currentItem.value;
      if (!item || redoStack.value.length === 0) return;
      // 当前状态保存进撤销栈，供再次"撤回"
      undoStack.value.push({ _s: serializeForCompare(item), item: deepClone(item) });
      if (undoStack.value.length > maxHistory) {
        undoStack.value.shift();
      }
      applySnapshot(redoStack.value.pop().item);
    };
    const setLayout = (value: ResumeLayout) => {
      layout.value = value;
    };
    const setFocusMode = (value: boolean) => {
      focusMode.value = value;
    };
    const setGenerating = (val: boolean) => {
      isGenerating.value = val;
    };
    const mergeResumeItem = (item: any) => {
      return merge(structuredClone(DEFAULT_RESUME_ITEM), item);
    };

    // 合并默认配置，补充新增字段
    const init = () => {
      system.value = merge(structuredClone(DEFAULT_SYSTEM), system.value);
    };

    // 监听当前简历内容变化（data/config/fixedConfig/ui 任意嵌套字段），冒泡记录撤销历史
    watch(
      () => currentItem.value,
      (item) => {
        // 历史开关关闭时暂停记录（初始化、同步及离开编辑器期间的变更不入历史）
        if (!historyEnabled.value) return;
        // 撤销/重做恢复触发的变化：消费标志并跳过，避免恢复动作又入栈
        if (skipNextWatch) {
          skipNextWatch = false;
          return;
        }
        // 无选中简历或尚未建立基准快照时忽略
        if (!item || !lastSnapshot) return;
        // 防抖记录历史：序列化比较与深拷贝延迟到停顿后统一执行
        recordHistory(item);
      },
      { deep: true },
    );
    // 切换简历时：取消防抖等待中的历史、清空历史栈并重置基准快照
    watch(currentIndex, () => {
      resetHistoryBase();
    });

    return {
      list,
      trashList,
      maxCount,
      currentIndex,
      layout,
      focusMode,
      isGenerating,
      setGenerating,
      system,
      initResumeStatus,
      syncConfigByData,
      addDataRecord,
      applyAiDataPatch,
      getModel,
      currentItem,
      currentData,
      currentConfig,
      currentFixedConfig,
      currentUI,
      currentUsage,
      isPrinting,
      selectedModule,
      selectModule,
      unselectModule,
      clearSelectedModules,
      setSelectedModules,
      pushSelectedModule,
      addResume,
      deleteResume,
      restoreResume,
      permanentlyDeleteResume,
      cleanExpiredTrash,
      getTrashRemainingDays,
      maxTrashCount,
      trashRetentionDays,
      setLayout,
      setFocusMode,
      undo,
      redo,
      undoStack,
      redoStack,
      resetHistoryBase,
      enableHistory,
      disableHistory,
      init,
      resetSettings,
    };
  },
  {
    persist: {
      pick: ["list", "trashList", "layout", "system"],
    },
  },
);
