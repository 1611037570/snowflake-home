import confirm from "@/components/business/confirm";
import router from "@/routers";
import { getUUID } from "@/utils";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { DEFAULT_RESUME_ITEM, DEFAULT_SYSTEM } from "./defaultConfig";

import { merge } from "lodash-es";
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
    // 是否正在打印
    const isPrinting = ref(false);
    // 是否AI生成中
    const isGenerating = ref(false);
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
    // 获取当前选中的简历项
    const getCurrentResumeItem = () => {
      return list.value[currentIndex.value];
    };

    // 获取当前选中的简历数据
    const currentData = computed(() => {
      const item = getCurrentResumeItem();
      return item ? item.data : undefined;
    });

    // 获取当前选中的表单配置
    const currentConfig = computed({
      get() {
        const item = getCurrentResumeItem();
        return item ? item.config : undefined;
      },
      set(newConfig: any) {
        const item = getCurrentResumeItem();
        if (item) {
          item.config = newConfig;
        }
      },
    });
    // 获取当前选中的固定配置
    const currentFixedConfig = computed({
      get() {
        const item = getCurrentResumeItem();
        return item ? item.fixedConfig : undefined;
      },
      set(newFixedConfig: any) {
        const item = getCurrentResumeItem();
        if (item) {
          item.fixedConfig = newFixedConfig;
        }
      },
    });
    // 获取当前选中的UI配置
    const currentUI = computed({
      get() {
        const item = getCurrentResumeItem();
        return item ? item.ui : undefined;
      },
      set(newUI: any) {
        const item = getCurrentResumeItem();
        if (item) {
          item.ui = newUI;
        }
      },
    });
    const currentUsage = computed(() => {
      const item = getCurrentResumeItem();
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
    const setLayout = (value: ResumeLayout) => {
      layout.value = value;
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

    return {
      list,
      maxCount,
      currentIndex,
      layout,
      isGenerating,
      setGenerating,
      system,
      initResumeStatus,
      getModel,
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
      init,
    };
  },
  {
    persist: {
      pick: ["list", "layout", "system"],
    },
  },
);
