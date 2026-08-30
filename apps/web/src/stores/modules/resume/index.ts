import confirm from "@/components/business/confirm";
import router from "@/routers";
import { getUUID } from "@/utils";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { DEFAULT_MODULE_NAMES, DEFAULT_RESUME_ITEM, DEFAULT_SYSTEM } from "./defaultConfig";

import { debounce, merge } from "lodash-es";
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
    // 深拷贝快照：structuredClone 无法直接克隆响应式 Proxy，先经 JSON 序列化脱代理再结构化克隆
    const deepClone = (value: any) => {
      if (value == null) return value;
      return structuredClone(JSON.parse(JSON.stringify(value)));
    };
    // 序列化简历内容（排除 usage），用于历史去重比较
    const serializeForCompare = (item: any) => {
      if (!item) return "";
      return JSON.stringify({
        data: item.data,
        config: item.config,
        fixedConfig: item.fixedConfig,
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
        // 撤销/重做恢复触发的变化：消费标志并跳过，避免恢复动作又入栈
        if (skipNextWatch) {
          skipNextWatch = false;
          return;
        }
        // 无选中简历或尚未建立基准快照时忽略
        if (!item || !lastSnapshot) return;
        // 内容相对上次快照有变化才记录一条历史，避免 usage 时间戳等无关变化入栈
        if (serializeForCompare(item) !== serializeForCompare(lastSnapshot)) {
          // 将修改前的状态作为历史（防抖合并后入栈）
          pushHistory(lastSnapshot);
          // 更新基准快照为当前内容，作为下次变化时的"修改前状态"
          lastSnapshot = deepClone(item);
        }
      },
      { deep: true },
    );
    // 切换简历时：取消防抖等待中的历史、清空历史栈并重置基准快照
    watch(currentIndex, () => {
      pushHistory.cancel();
      undoStack.value = [];
      redoStack.value = [];
      lastSnapshot = currentItem.value ? deepClone(currentItem.value) : null;
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
