import { computed, nextTick, ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { CUSTOM_MODULE_ICON, DEFAULT_MODULE_NAMES } from "@/stores/modules/resume/defaultConfig";
import eventBus from "@/utils/modules/eventBus";
import { setFieldHidden } from "./utils";
import { isFieldMuted, isFieldVisible } from "@/components/business/dynamicForm/code/fieldVisible";
import { ElNotification } from "element-plus";

// store 为全局单例：模块列表与跳转逻辑无组件级状态，抽为模块级共享，避免各组件重复创建 hook
const resumeStore = useResumeStore();
const { currentData, runtimeFields, layout } = storeToRefs(resumeStore);
const PREVIEW_SCROLL_OFFSET = 24;
// 左侧搜索定位使用独立状态，不写入预览选择按钮使用的 selectedModule
export const previewSelectedModule = ref<string | null>(null);

// 清除编辑区定位产生的预览激活状态
export const clearPreviewSelection = (key: string) => {
  if (previewSelectedModule.value === key) previewSelectedModule.value = null;
};

// 模块锚点列表：全部模块（含隐藏模块，便于搜索定位）；预览分页仍按显隐协议过滤
const moduleList = computed(() => {
  const data = currentData.value;
  const fields = runtimeFields.value || [];
  return (
    fields
      // 跳过无 key 字段（历史/导入数据可能缺失，无 key 无法作为导航锚点）
      .filter((field) => field?.key)
      .map((field) => {
        // 图标统一查默认模块元数据表，自定义模块前缀单独走 puzzle 图标
        const icon =
          DEFAULT_MODULE_NAMES.find((item) => item.key === field.key)?.icon ||
          (field.key.startsWith("custom") ? CUSTOM_MODULE_ICON : "ic:round-add");
        return {
          key: field.key,
          name: resumeStore.getModel(field.key)?.name || field.name || field.key,
          icon,
          hidden: isFieldMuted(data, field),
          field, // 原始字段配置，用于恢复隐藏模块
        };
      })
  );
});

// 跳转预览区：滚动定位并激活当前模块边框
export const jumpPreview = (key: string) => {
  previewSelectedModule.value = key;
  nextTick(() => {
    const target = document.querySelector<HTMLElement>(
      `.resume-page-item .resume-module-wrapper[data-module="${key}"]`,
    );
    const wrap = target?.closest<HTMLElement>(".el-scrollbar__wrap");
    if (!target || !wrap) return;
    const targetTop =
      target.getBoundingClientRect().top - wrap.getBoundingClientRect().top + wrap.scrollTop;
    wrap.scrollTo({
      top: Math.max(0, targetTop - PREVIEW_SCROLL_OFFSET),
      behavior: "smooth",
    });
  });
};

// 跳转编辑区：展开折叠 + 选中闪烁 + 滚动定位
export const jumpEditor = (key: string) => {
  const item = moduleList.value.find((m) => m.key === key);
  // 归档模块不在左侧编辑区展示，定位时提示用户先恢复模块
  if (item && isFieldVisible(currentData.value, item.field)) {
    ElNotification({
      title: "模块已归档",
      message: "请先在左侧恢复归档后再编辑该模块。",
      type: "warning",
      position: "top-right",
      offset: 40,
      duration: 3000,
    });
    return;
  }
  // 切换到编辑标签，避免停留设计/模板标签时编辑区不可见
  eventBus.emit("switch-builder-tab", 0);
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

// 跳转编辑区（含隐藏恢复与布局切换）：供进度条等复用
export const jumpToEditor = (key: string) => {
  const item = moduleList.value.find((m) => m.key === key);
  // 复用恢复函数：隐藏模块置为可见，使编辑区与预览区重新渲染该模块
  if (item?.hidden) {
    setFieldHidden(currentData.value, item.field, false);
  }
  // 编辑区未打开时先切三栏布局
  if (layout.value === "ai") {
    resumeStore.setLayout("three");
  }
  jumpEditor(key);
};

// 联动跳转：编辑区 + 预览区（模块导航使用）
export const jumpAll = (key: string) => {
  jumpToEditor(key);
  jumpPreview(key);
};

// 按关键词过滤模块锚点
const filterModules = (kw: string) => {
  if (!kw) return moduleList.value;
  return moduleList.value.filter((m) => m.name.includes(kw) || m.key.includes(kw));
};

/**
 * 模块导航搜索逻辑：维护搜索关键词状态，供模块导航器使用
 * 跳转函数已抽为模块级纯函数，其他组件无需再创建 hook
 */
export function useModuleNav() {
  // 搜索关键词
  const keyword = ref("");
  const filteredList = computed(() => filterModules(keyword.value.trim()));

  return {
    moduleList,
    keyword,
    filteredList,
    jumpAll,
    jumpToEditor,
    jumpPreview,
    jumpEditor,
    previewSelectedModule,
  };
}
