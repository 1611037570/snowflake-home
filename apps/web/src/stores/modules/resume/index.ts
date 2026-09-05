import confirm from "@/components/business/confirm";
import router from "@/routers";
import { getUUID } from "@/utils";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { DEFAULT_MODULE_NAMES, DEFAULT_RESUME_ITEM, DEFAULT_SYSTEM } from "./defaultConfig";
import { allConfig } from "./formConfig";

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
      // 按当前简历 data 换取最新默认表单配置，避免与默认配置出现差异
      refreshConfigByData();
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
    // 深拷贝快照：structuredClone 无法直接克隆响应式 Proxy，先经 JSON 序列化脱代理再结构化克隆
    const deepClone = (value: any) => {
      if (value == null) return value;
      return structuredClone(JSON.parse(JSON.stringify(value)));
    };
    // 数组型模块按 data 条数补齐 list，不清空已有 list 仅追加缺失子项
    function fillArrayListByData(field: any, data: any) {
      const arrayField = field.fields?.find((f: any) => f.type === "array");
      if (!arrayField?.addConfig) return;
      // 由 addConfig 首项绑定路径解析数据数组路径（截取 "?" 之前的部分）
      const source: string[] | undefined = arrayField.addConfig.model?.[0]?.source;
      if (!Array.isArray(source)) return;
      const index = source.indexOf("?");
      if (index === -1) return;
      const dataArray = source
        .slice(0, index)
        .reduce((acc: any, key: string) => acc?.[key], data);
      const count = Array.isArray(dataArray) ? dataArray.length : 0;
      while (arrayField.list.length < count) {
        arrayField.list.push(structuredClone(arrayField.addConfig));
      }
    }
    // 自定义模块 key 为 custom_随机串，将 custom 默认模板的 key 与数据路径首段改写为实际 key
    function rewriteCustomFieldByKey(field: any, customKey: string, customName: string) {
      field.key = customKey;
      field.name = customName;
      field.model?.forEach((item: any) => {
        if (Array.isArray(item.source)) {
          item.source[0] = customKey;
          if (item.prop === "name") {
            item.defaultValue = customName;
          }
        }
      });
      if (Array.isArray(field.checks?.hidden?.path)) {
        field.checks.hidden.path[0] = customKey;
      }
      const arrayField = field.fields?.find((f: any) => f.type === "array");
      if (arrayField?.addConfig) {
        arrayField.addConfig.model?.forEach((item: any) => {
          if (Array.isArray(item.source)) {
            item.source[0] = customKey;
          }
        });
        arrayField.addConfig.fields?.forEach((subField: any) => {
          if (Array.isArray(subField.model?.source)) {
            subField.model.source[0] = customKey;
          }
        });
      }
    }
    // 以当前简历 data 为准，将各模块表单配置刷新为最新默认配置
    function refreshConfigByData() {
      const item = currentItem.value;
      if (!item) return;
      const data = item.data;
      if (!data || typeof data !== "object") return;
      let changed = false;
      Object.keys(data).forEach((key) => {
        // custom 前缀模块统一使用 custom 默认模板
        const isCustomModule = key.startsWith("custom");
        const defaultForm = isCustomModule ? allConfig.custom : allConfig[key];
        if (!defaultForm) return;
        // user 模块属于固定配置，其余模块属于可编辑配置
        const targetConfig = key === "user" ? item.fixedConfig : item.config;
        if (!targetConfig || !Array.isArray(targetConfig.fields)) return;
        // user 默认配置为字段数组，其余模块为单条字段
        const defaultFields = Array.isArray(defaultForm) ? defaultForm : [defaultForm];
        defaultFields.forEach((defaultField: any) => {
          const newField = structuredClone(defaultField);
          if (isCustomModule) {
            // custom 模板按实际模块 key 重写，并沿用原有模块标题
            const existField = targetConfig.fields.find((f: any) => f?.key === key);
            rewriteCustomFieldByKey(newField, key, existField?.name || data[key]?.name || "");
          }
          const fieldKey = newField.key;
          if (!fieldKey) return;
          // 替换同 key 模块为最新默认配置，缺失模块追加到末尾
          // 数组型模块默认 list 为空，按 data 已有条数补齐子项
          fillArrayListByData(newField, data);
          const fieldIndex = targetConfig.fields.findIndex((f: any) => f?.key === fieldKey);
          if (fieldIndex > -1) {
            targetConfig.fields[fieldIndex] = newField;
          } else {
            targetConfig.fields.push(newField);
          }
          changed = true;
        });
      });
      // 自动同步不产生撤销历史，将基准快照对齐到同步后的内容
      if (changed) {
        lastSnapshot = deepClone(item);
      }
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
      recordHistory.cancel();
      pushHistory.cancel();
      undoStack.value = [];
      redoStack.value = [];
      lastSnapshot = currentItem.value ? deepClone(currentItem.value) : null;
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
