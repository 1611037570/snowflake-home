import { computed } from "vue";
import { storeToRefs } from "pinia";
import { getFieldLabel, getModelBindings, unwrapField, walkFormFields } from "@/components/business/dynamicForm/api";
import { useResumeStore } from "@/stores";
import { stripHtml } from "../toolbar/modules/progress/useResumeStats";

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
