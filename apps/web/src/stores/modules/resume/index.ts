import confirm from "@/components/business/confirm";
import router from "@/routers";
import { getUUID } from "@/utils";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { DEFAULT_CONFIG, DEFAULT_USER_CONFIG } from "./formConfig";
import { DEFAULT_UI } from "./uiConfig";

import { merge } from "lodash-es";
export type ResumeLayout = "list" | "three" | "ai";
// 默认模块 key 对应的名称（取自 formConfig，后期自行维护）
const DEFAULT_MODULE_NAMES: { key: string; name: string }[] = [
  { key: "user", name: "用户信息" },
  { key: "account", name: "社交账号" },
  { key: "education", name: "教育经历" },
  { key: "skill", name: "专业技能" },
  { key: "advantage", name: "个人优势" },
  { key: "work", name: "工作经历" },
  { key: "project", name: "项目经历" },
];
// 默认简历项
const DEFAULT_RESUME_ITEM = {
  // 简历ID
  id: getUUID().slice(0, 6),
  // 简历数据
  data: structuredClone({}),
  // 固定配置
  fixedConfig: structuredClone(DEFAULT_USER_CONFIG),
  // 表单配置
  config: structuredClone(DEFAULT_CONFIG),
  // UI配置
  ui: structuredClone(DEFAULT_UI),
  // 使用信息
  usage: {
    // 是否自定义标题
    customTitle: "",
    // 最后使用时间
    lastUseTime: Date.now(),
    // 创建时间
    createTime: Date.now(),
  },
};
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
    // 初始化状态
    function initStatus() {
      isPrinting.value = false;
      isGenerating.value = false;
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
    const pushSelectedModule = (key: string) => {
      if (!key) return;
      if (key.startsWith("custom")) {
        selectedModule.value.push({
          key,
          name: currentData.value?.[key]?.name || "",
        });
      }
      const name = DEFAULT_MODULE_NAMES.find((item) => item.key === key);

      selectedModule.value.push({
        key,
        name,
      });
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
    // 初始化数据合并，防止版本更新导致字段缺失
    const init = () => {
      list.value = list.value.map(mergeResumeItem);
    };

    return {
      list,
      maxCount,
      currentIndex,
      layout,
      isGenerating,
      setGenerating,
      initStatus,
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
      pick: ["list", "layout"],
    },
  },
);
