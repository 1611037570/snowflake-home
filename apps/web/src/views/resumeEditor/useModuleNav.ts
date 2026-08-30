import { computed, nextTick, ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import eventBus from "@/utils/modules/eventBus";
import { setFieldHidden } from "./utils";
import { isFieldHidden } from "@/components/business/dynamicForm/code/fieldVisible";

// 模块 key → 图标映射（自定义模块统一使用 puzzle 图标）
export const MODULE_ICONS: Record<string, string> = {
  user: "mdi:account",
  account: "mdi:account-box-outline",
  education: "mdi:school-outline",
  skill: "mdi:hammer-wrench",
  advantage: "fa6-solid:seedling",
  work: "lucide:briefcase",
  project: "mdi:code-tags",
  custom: "mdi:puzzle-outline",
};

/**
 * 模块导航共享逻辑：模块锚点列表 + 搜索过滤 + 预览/编辑区跳转
 * 供模块导航器（弹窗/悬浮）与编辑区索引条复用
 */
export function useModuleNav() {
  const resumeStore = useResumeStore();
  const { currentData, currentConfig, currentFixedConfig, selectedModule, layout } =
    storeToRefs(resumeStore);

  // 模块锚点列表：全部模块（含隐藏模块，便于搜索定位）；预览分页仍按显隐协议过滤
  const moduleList = computed(() => {
    const data = currentData.value;
    const fields = [
      ...(currentFixedConfig.value?.fields || []),
      ...(currentConfig.value?.fields || []),
    ];
    return fields
      // 跳过无 key 字段（历史/导入数据可能缺失，无 key 无法作为导航锚点）
      .filter((field) => field?.key)
      .map((field) => ({
        key: field.key,
        name: resumeStore.getModel(field.key)?.name || field.name || field.key,
        icon: MODULE_ICONS[field.key.startsWith("custom") ? "custom" : field.key] || "ic:round-add",
        hidden: isFieldHidden(data, field),
        field, // 原始字段配置，用于恢复隐藏模块
      }));
  });

  // 搜索关键词
  const keyword = ref("");
  const filteredList = computed(() => {
    const kw = keyword.value.trim();
    if (!kw) return moduleList.value;
    return moduleList.value.filter((m) => m.name.includes(kw) || m.key.includes(kw));
  });

  // 跳转预览区：滚动定位 + 仅高亮当前模块（清空历史选中，避免高亮堆积）
  const jumpPreview = (key: string) => {
    nextTick(() => {
      document
        .querySelector(`[data-module="${key}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    // 重置选中态：只保留当前模块，触发预览 outline 高亮
    selectedModule.value = [
      { key, name: moduleList.value.find((m) => m.key === key)?.name },
    ];
  };

  // 跳转编辑区：展开折叠 + 选中闪烁 + 滚动定位
  const jumpEditor = (key: string) => {
    // 展开模块折叠面板
    const moduleData = currentData.value?.[key];
    if (moduleData && Array.isArray(moduleData.collapsed)) {
      moduleData.collapsed = ["1"];
    }
    // 触发编辑区模块选中闪烁
    eventBus.emit("df-select-module", key);
    nextTick(() => {
      document
        .querySelector(`[data-module-key="${key}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // 联动跳转：隐藏模块先恢复渲染再定位；编辑区未打开时先切三栏布局
  const jumpAll = (key: string) => {
    const item = moduleList.value.find((m) => m.key === key);
    // 复用恢复函数：隐藏模块置为可见，使编辑区与预览区重新渲染该模块
    if (item?.hidden) {
      setFieldHidden(currentData.value, item.field, false);
    }
    if (layout.value === "ai") {
      resumeStore.setLayout("three");
    }
    jumpEditor(key);
    jumpPreview(key);
  };

  return { moduleList, keyword, filteredList, jumpAll, jumpPreview, jumpEditor };
}
