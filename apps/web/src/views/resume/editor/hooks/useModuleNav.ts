import { computed, nextTick, ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { CUSTOM_MODULE_ICON, DEFAULT_MODULE_NAMES } from "@/stores/modules/resume/config/defaultConfig";
import eventBus from "@/utils/modules/eventBus";
import {
  getFieldLabel,
  getModelBindings,
  isFieldRemoved,
  unwrapField,
  walkFormFields,
} from "@/components/business/dynamicForm/api";
import { ElNotification } from "element-plus";
import { $t } from "@/locales";
import { stripHtml } from "../toolbar/modules/progress/useResumeStats";
import { useScrollEditorTo } from "./useScrollEditorTo";

// 搜索命中项：携带定位所需的层级信息
export interface ResumeSearchHit {
  // 命中内容所属模块
  moduleKey: string;
  // 数组模块的记录下标，对象模块无此信息
  itemIndex?: number;
  // 命中字段标识
  fieldKey: string;
  // 命中字段标签，缺失时回落字段标识
  label: string;
  // 数组模块的记录标题，用于在结果中区分第几段
  recordTitle: string;
  // 命中字段的纯文本内容
  text: string;
}

// 搜索忽略字段：媒体与界面状态不参与内容搜索
const SKIP_FIELDS = ["avatar", "img", "collapsed", "hidden"];

// 字段标签映射：模块内字段标识对应中文标签，供搜索结果展示
function buildLabelMap(fields: any[]) {
  const labels = new Map<string, string>();
  walkFormFields(fields, (field: any) => {
    // 标签由包裹组声明、数据绑定在内层字段，需先解包再取标识
    const target = unwrapField(field) ?? field;
    const binding = getModelBindings(target).find(
      (item: any) => !item.raw && item.source?.[0] === "data",
    );
    const key = binding?.source?.[binding.source.length - 1];
    const label = getFieldLabel(field) || getFieldLabel(target);
    if (key && label && !labels.has(key)) labels.set(key, label);
  });
  return labels;
}

// 收集值的文本：富文本剥离标签，嵌套结构递归展开
function collectTexts(value: unknown, result: string[]) {
  if (typeof value === "string") {
    const text = stripHtml(value);
    if (text) result.push(text);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectTexts(item, result));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => {
      if (SKIP_FIELDS.includes(key)) return;
      collectTexts(child, result);
    });
  }
}

// 字段值的搜索文本：同一字段的嵌套内容合并为一项，避免结果行过碎
function fieldText(value: unknown) {
  const texts: string[] = [];
  collectTexts(value, texts);
  return texts.join(" ");
}

// 构建搜索索引：按模块 → 记录 → 字段三层收集实际填写的内容
function buildSearchIndex(moduleFields: any[], data: any): ResumeSearchHit[] {
  const hits: ResumeSearchHit[] = [];

  moduleFields.forEach((moduleField: any) => {
    const moduleKey = moduleField?.key;
    const moduleData = moduleKey ? data?.[moduleKey] : undefined;
    if (!moduleKey || !moduleData || typeof moduleData !== "object") return;

    const labels = buildLabelMap(moduleField.fields ?? []);
    const pushHit = (fieldKey: string, value: unknown, itemIndex?: number, recordTitle = "") => {
      if (SKIP_FIELDS.includes(fieldKey)) return;
      const text = fieldText(value);
      if (!text) return;
      hits.push({
        moduleKey,
        itemIndex,
        fieldKey,
        label: labels.get(fieldKey) || fieldKey,
        recordTitle,
        text,
      });
    };

    // 数组模块：每条记录单独成层，记录内字段各自成项
    if (Array.isArray(moduleData.list)) {
      moduleData.list.forEach((record: any, index: number) => {
        const recordData = record?.data;
        if (!recordData || typeof recordData !== "object") return;
        // 记录标题取名称与职位，缺失时由展示侧回落为序号
        const recordTitle = String(recordData.name || recordData.post || "");
        Object.entries(recordData).forEach(([key, value]) => pushHit(key, value, index, recordTitle));
      });
      return;
    }

    // 对象模块：字段值直接成项
    if (moduleData.data && typeof moduleData.data === "object") {
      Object.entries(moduleData.data).forEach(([key, value]) => pushHit(key, value));
    }
  });

  return hits;
}

/**
 * 简历内容搜索：把实际填写的内容摊平成可搜索项，供模块导航按内容查找
 * 索引随简历数据自动重建，数据量小无需缓存策略
 */
export function useResumeSearch() {
  const resumeStore = useResumeStore();
  const { currentData, runtimeFields } = storeToRefs(resumeStore);

  const searchIndex = computed<ResumeSearchHit[]>(() =>
    buildSearchIndex(runtimeFields.value || [], currentData.value),
  );

  return { searchIndex };
}

// store 为全局单例：模块列表与跳转逻辑无组件级状态，抽为模块级共享，避免各组件重复创建 hook
const resumeStore = useResumeStore();
const { currentData, runtimeFields } = storeToRefs(resumeStore);
const { searchIndex } = useResumeSearch();
const PREVIEW_HIGHLIGHT_DELAY = 10;
const EDITOR_HIGHLIGHT_DELAY = 0;
// 鼠标进入事件可能由滚动触发，等滚动停止后再允许清除定位高亮
const PREVIEW_SCROLL_SETTLE_DELAY = 150;
const PREVIEW_SCROLL_FALLBACK_DELAY = 2000;
let previewHighlightTimer: number | null = null;
let previewHighlightLock = false;
let previewScrollTarget: EventTarget | null = null;
let previewScrollSettleTimer: number | null = null;
let editorHighlightTimer: number | null = null;
// 编辑标签未激活时暂存预览点击的定位动作，待表单挂载后执行。
let pendingEditorLocation: (() => boolean) | null = null;
// 左侧搜索定位使用独立状态，不写入预览选择按钮使用的 selectedModule
export const previewSelectedModule = ref<string | null>(null);

const releasePreviewHighlightLock = () => {
  if (previewScrollTarget) {
    previewScrollTarget.removeEventListener("scroll", settlePreviewScroll);
    previewScrollTarget.removeEventListener("scrollend", settlePreviewScroll);
    previewScrollTarget = null;
  }
  if (previewScrollSettleTimer !== null) window.clearTimeout(previewScrollSettleTimer);
  previewScrollSettleTimer = null;
  previewHighlightLock = false;
};

const settlePreviewScroll = () => {
  if (previewScrollSettleTimer !== null) window.clearTimeout(previewScrollSettleTimer);
  previewScrollSettleTimer = window.setTimeout(
    releasePreviewHighlightLock,
    PREVIEW_SCROLL_SETTLE_DELAY,
  );
};

// 鼠标进入定位模块后清除预览边框
export const clearPreviewSelection = (key: string) => {
  // 滚动定位尚未结束时忽略鼠标进入，避免边框刚出现就被清除
  if (previewHighlightLock) return;
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
          name:
            resumeStore.getModel(field.key)?.name ||
            field.model?.find((item: any) => item?.prop === "title")?.defaultValue ||
            field.key,
          icon,
          hidden: data?.[field.key]?.ui?.hidden === true,
          archived: isFieldRemoved(data, field),
          field, // 原始字段配置，用于恢复隐藏模块
        };
      })
  );
});

// 跳转预览区：滚动定位并激活当前模块边框
export const jumpPreview = (key: string) => {
  if (previewHighlightTimer !== null) window.clearTimeout(previewHighlightTimer);
  releasePreviewHighlightLock();
  previewSelectedModule.value = null;
  // 滚动动画期间锁住鼠标进入的清除行为
  previewHighlightLock = true;
  // 延迟添加边框，避开查找滚动触发的鼠标进入事件
  previewHighlightTimer = window.setTimeout(() => {
    previewSelectedModule.value = key;
    previewHighlightTimer = null;
  }, PREVIEW_HIGHLIGHT_DELAY);
  nextTick(() => {
    const target = document.querySelector<HTMLElement>(
      `.resume-page-item .resume-module-wrapper[data-module="${key}"]`,
    );
    const scrollTarget = useScrollEditorTo(target);
    if (!scrollTarget) {
      releasePreviewHighlightLock();
      return;
    }
    previewScrollTarget = scrollTarget;
    previewScrollTarget.addEventListener("scroll", settlePreviewScroll, { passive: true });
    previewScrollTarget.addEventListener("scrollend", settlePreviewScroll, { passive: true });
    previewScrollSettleTimer = window.setTimeout(
      releasePreviewHighlightLock,
      PREVIEW_SCROLL_FALLBACK_DELAY,
    );
  });
};

// 归档模块不在左侧编辑区展示，定位时提示用户先恢复模块
const notifyArchived = () => {
  ElNotification({
    title: $t("archived"),
    message: $t("restoreArchivedBeforeEdit"),
    type: "warning",
    position: "top-right",
    offset: 40,
    duration: 3000,
  });
};

// 展开模块折叠面板并触发编辑区选中闪烁：定位类跳转的公共前置动作
const activateModule = (key: string) => {
  // 切换到编辑标签，避免停留设计/模板标签时编辑区不可见
  eventBus.emit("switch-builder-tab", 0);
  // 展开模块折叠面板
  const moduleData = currentData.value?.[key];
  if (moduleData) {
    moduleData.ui ??= {};
    moduleData.ui.collapsed = ["1"];
  }
  // 触发编辑区模块选中闪烁
  scheduleEditorHighlight(key);
};

// 滚动到编辑区锚点：记录命中取该条记录外圈，字段命中取字段外圈，其余回退模块外圈
const scrollEditorTarget = (
  key: string,
  hit?: Pick<ResumeSearchHit, "itemIndex" | "fieldKey">,
) => {
  const selector =
    hit?.itemIndex != null
      ? `[data-module-key="${key}"] [data-item-index="${hit.itemIndex}"]`
      : `[data-module-key="${hit?.fieldKey ?? key}"]`;
  const target =
    document.querySelector<HTMLElement>(selector) ??
    document.querySelector<HTMLElement>(`[data-module-key="${key}"]`);
  if (!target) return false;
  useScrollEditorTo(target);
  return true;
};

// 编辑表单可见后完成暂存的定位，找不到模块时继续等待表单渲染。
export const flushPendingEditorLocation = () => {
  if (pendingEditorLocation?.()) pendingEditorLocation = null;
};

// 延时 0 添加选中状态，避开同一轮定位滚动触发的鼠标进入事件
const scheduleEditorHighlight = (key: string, hit?: Pick<ResumeSearchHit, "itemIndex">) => {
  if (editorHighlightTimer !== null) window.clearTimeout(editorHighlightTimer);
  editorHighlightTimer = window.setTimeout(() => {
    eventBus.emit(
      "df-select-module",
      hit?.itemIndex == null ? key : { key, index: hit.itemIndex },
    );
    editorHighlightTimer = null;
  }, EDITOR_HIGHLIGHT_DELAY);
};

// 跳转编辑区并保留模块当前的折叠状态
export const jumpEditor = (key: string) => {
  locateEditor(key);
};

// 定位到搜索命中行：展开模块与命中记录，滚动到最精确的锚点
export const jumpToHit = (moduleKey: string, hit?: ResumeSearchHit) => {
  const item = moduleList.value.find((m) => m.key === moduleKey);
  if (item && isFieldRemoved(currentData.value, item.field)) {
    notifyArchived();
    return;
  }
  activateModule(moduleKey);
  // 数组模块：展开命中所在的记录，记录处于折叠状态时看不到命中内容
  const record =
    hit?.itemIndex != null ? currentData.value?.[moduleKey]?.list?.[hit.itemIndex] : undefined;
  if (record) {
    record.ui ??= {};
    record.ui.collapsed = ["1"];
  }
  nextTick(() => scrollEditorTarget(moduleKey, hit));
};

// 预览区定位编辑区：仅切标签、选中闪烁与滚动定位，不展开折叠，避免点击查找改变编辑区折叠状态
export const locateEditor = (key: string, hit?: Pick<ResumeSearchHit, "itemIndex">) => {
  const item = moduleList.value.find((m) => m.key === key);
  if (item && isFieldRemoved(currentData.value, item.field)) {
    notifyArchived();
    return;
  }
  // 模块折叠时子记录可能仍在 DOM 中，定位应回到主模块
  const collapsed = currentData.value?.[key]?.ui?.collapsed;
  const targetHit = Array.isArray(collapsed) && !collapsed.includes("1") ? undefined : hit;
  pendingEditorLocation = () => {
    if (!scrollEditorTarget(key, targetHit)) return false;
    scheduleEditorHighlight(key, targetHit);
    return true;
  };
  // 切换到编辑标签，避免停留设计/模板标签时编辑区不可见
  eventBus.emit("switch-builder-tab", 0);
  nextTick(flushPendingEditorLocation);
};

// 跳转编辑区（含隐藏恢复）：供进度条等复用
export const jumpToEditor = (key: string) => {
  const item = moduleList.value.find((m) => m.key === key);
  // 复用恢复能力：隐藏模块置为可见，使编辑区与预览区重新渲染该模块
  if (item?.hidden) {
    resumeStore.setModuleHidden(key, false);
  }
  jumpEditor(key);
};

// 联动跳转：编辑区 + 预览区（模块导航使用）
export const jumpAll = (key: string) => {
  jumpToEditor(key);
  jumpPreview(key);
};

/**
 * 模块导航搜索逻辑：维护搜索关键词状态，供模块导航器使用
 * 同时匹配模块名称与简历内容，跳转函数已抽为模块级纯函数，其他组件无需再创建 hook
 */
export function useModuleNav() {
  // 每个模块查找入口维护独立搜索词
  const keyword = ref("");
  // 搜索结果：模块名命中或内容命中，未输入关键词时等价于模块列表
  const searchResults = computed(() => {
    const kw = keyword.value.trim().toLowerCase();
    if (!kw) {
      return moduleList.value.map((item) => ({
        ...item,
        matchedByName: false,
        hits: [] as ResumeSearchHit[],
      }));
    }
    // 内容命中按模块归组：命中项保留记录下标与字段标识，供精确定位使用
    const hitsByModule = new Map<string, ResumeSearchHit[]>();
    searchIndex.value.forEach((hit) => {
      if (!hit.text.toLowerCase().includes(kw)) return;
      const list = hitsByModule.get(hit.moduleKey);
      if (list) list.push(hit);
      else hitsByModule.set(hit.moduleKey, [hit]);
    });
    return moduleList.value
      .map((item: any) => ({
        ...item,
        matchedByName: item.name.toLowerCase().includes(kw) || item.key.toLowerCase().includes(kw),
        hits: hitsByModule.get(item.key) ?? [],
      }))
      .filter((result: any) => result.matchedByName || result.hits.length);
  });

  return {
    moduleList,
    keyword,
    searchResults,
    jumpAll,
    jumpToEditor,
    jumpPreview,
    jumpEditor,
    jumpToHit,
    locateEditor,
    previewSelectedModule,
  };
}
