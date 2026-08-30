import confirm from "@/components/business/confirm";
import router from "@/routers";
import { getUUID } from "@/utils";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { DEFAULT_MODULE_NAMES, DEFAULT_RESUME_ITEM, DEFAULT_SYSTEM } from "./defaultConfig";

import { cloneDeep, debounce, merge } from "lodash-es";
export type ResumeLayout = "list" | "three" | "ai";

export const useResumeStore = defineStore(
  "resume",
  () => {
    // 简历列表
    const list = ref<any[]>([]);
    // 最大简历数量
    const maxCount = 5;
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
    // 撤销历史栈
    const undoStack = ref<any[]>([]);
    // 重做历史栈
    const redoStack = ref<any[]>([]);
    // 撤销历史最大条数
    const maxHistory = 12;
    // 恢复快照时跳过下次监听的标志
    let skipNextWatch = false;
    // 上一次的完整内容快照（深拷贝），作为撤销历史基准
    let lastSnapshot: any = null;
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
    const selectedModule = ref<any[]>([]);
    // 获取模块名称
    const getModel = (key: string) => {
      if (!key) return;
      if (key.startsWith("custom")) {
        return {
          key,
          name: currentData.value?.[key]?.name || "",
        };
      }
      return DEFAULT_MODULE_NAMES.find((item) => item.key === key) || {};
    };
    // 添加选中模块
    const pushSelectedModule = (key: string) => {
      const data = getModel(key);
      selectedModule.value.push(data);
    };
    // 新增简历
    const addResume = (config: any) => {
      if (list.value.length >= maxCount) {
        confirm(`请前往我的简历管理删除后再新建。`, "容量已满").then(() => {
          router.push("/resume/mine");
        });
        return;
      }
      const res = config ? mergeResumeItem(config) : structuredClone(DEFAULT_RESUME_ITEM);
      // 每次新增都重新生成唯一ID，避免多份简历共用一个ID
      res.id = getUUID().slice(0, 6);
      list.value.push(res);
      currentIndex.value = list.value.length - 1;
      router.push({ path: "/resumeEditor", query: { id: res.id } });
    };
    // 删除简历
    const deleteResume = () => {
      if (currentIndex.value == -1) {
        return;
      }
      list.value.splice(currentIndex.value, 1);
      currentIndex.value = -1;
    };
    // 序列化简历内容（排除 usage），用于历史去重
    const serializeForCompare = (item: any) => {
      if (!item) return "";
      return JSON.stringify({
        data: item.data,
        config: item.config,
        fixedConfig: item.fixedConfig,
        ui: item.ui,
      });
    };
    // 防抖写入撤销历史，将连续编辑合并为一条
    const pushHistory = debounce((oldItem: any) => {
      const item = currentItem.value;
      if (!item || !oldItem || oldItem.id !== item.id) return;
      const serialized = serializeForCompare(oldItem);
      const top = undoStack.value[undoStack.value.length - 1];
      if (top && top._s === serialized) return;
      undoStack.value.push({ _s: serialized, item: oldItem });
      if (undoStack.value.length > maxHistory) {
        undoStack.value.shift();
      }
      redoStack.value = [];
    }, 500);
    // 应用历史快照，仅恢复内容字段，保留 id 与 usage
    const applySnapshot = (snapItem: any) => {
      const item = currentItem.value;
      if (!item) return;
      skipNextWatch = true;
      item.data = snapItem.data;
      item.config = snapItem.config;
      item.fixedConfig = snapItem.fixedConfig;
      item.ui = snapItem.ui;
      // 恢复后同步基准快照，避免下次编辑误记历史
      lastSnapshot = cloneDeep(item);
    };
    // 撤回
    const undo = () => {
      const item = currentItem.value;
      if (!item || undoStack.value.length === 0) return;
      redoStack.value.push({ _s: serializeForCompare(item), item: cloneDeep(item) });
      if (redoStack.value.length > maxHistory) {
        redoStack.value.shift();
      }
      applySnapshot(undoStack.value.pop().item);
    };
    // 重做
    const redo = () => {
      const item = currentItem.value;
      if (!item || redoStack.value.length === 0) return;
      undoStack.value.push({ _s: serializeForCompare(item), item: cloneDeep(item) });
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

    // 监听当前简历内容变化，冒泡记录撤销历史
    watch(
      () => currentItem.value,
      (item) => {
        if (skipNextWatch) {
          skipNextWatch = false;
          return;
        }
        if (!item || !lastSnapshot) return;
        // 内容相对上次快照有变化才记录一条历史，避免 usage 等无关变化入栈
        if (serializeForCompare(item) !== serializeForCompare(lastSnapshot)) {
          pushHistory(lastSnapshot);
          lastSnapshot = cloneDeep(item);
        }
      },
      { deep: true },
    );
    // 切换简历时取消待写入历史、清空历史栈并重置基准快照
    watch(currentIndex, () => {
      pushHistory.cancel();
      undoStack.value = [];
      redoStack.value = [];
      lastSnapshot = currentItem.value ? cloneDeep(currentItem.value) : null;
    });

    return {
      list,
      maxCount,
      currentIndex,
      layout,
      focusMode,
      isGenerating,
      setGenerating,
      system,
      initResumeStatus,
      getModel,
      currentItem,
      currentData,
      currentConfig,
      currentFixedConfig,
      currentUI,
      currentUsage,
      isPrinting,
      selectedModule,
      pushSelectedModule,
      addResume,
      deleteResume,
      setLayout,
      setFocusMode,
      undo,
      redo,
      undoStack,
      redoStack,
      init,
    };
  },
  {
    persist: {
      pick: ["list", "layout", "system"],
    },
  },
);
