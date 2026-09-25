import { toValue, type MaybeRefOrGetter } from "vue";
import {
  createDataPathContext,
  getArrayDataPath,
  getFieldLabel,
  getModelBindings,
  resolveDataPath,
  unwrapField,
  walkFormFields,
} from "@/components/business/dynamicForm/api";
import { $t } from "@/locales";

// ==================== 工具函数 ====================

const getValueByPath = (obj: any, path: (string | number)[]): any => {
  let cur = obj;
  for (const key of path) {
    if (cur == null) return undefined;
    cur = cur[key];
  }
  return cur;
};

const isEmpty = (val: any): boolean =>
  val == null ||
  (typeof val === "string" && val.trim() === "") ||
  (Array.isArray(val) && val.length === 0) ||
  (typeof val === "object" && !Array.isArray(val) && Object.keys(val).length === 0);

const isContentEmpty = (val: any): boolean => {
  if (typeof val !== "string") return true;
  // 去掉全部标签与占位空格后无文本即为空，判定口径与预览侧保持一致
  return (
    val
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .trim() === ""
  );
};

const getLabel = (field: any, prop: string): string => getFieldLabel(field) || prop || $t("field");

// 模块名称优先读取 ui.title，缺失时回退标题模型默认值
const getModuleTitle = (config: any, rootData: Record<string, any>, key: string): string =>
  rootData?.[key]?.ui?.title ||
  config.model?.find((item: any) => item?.prop === "title")?.defaultValue ||
  key;

const getFieldMeta = (field: any) => {
  const model = field?.model ? (Array.isArray(field.model) ? field.model[0] : field.model) : field;
  const src = Array.isArray(model?.source) ? model.source : [];
  const prop = model?.prop || src[src.length - 1] || "";
  return { src, prop };
};

// ==================== 分析单个模块 ====================

function analyzeModule(moduleConfig: any, rootData: any) {
  if (!moduleConfig?.fields?.length) {
    return { missing: [], score: 0 };
  }

  const missing: string[] = [];
  let done = 0;
  let total = 0;
  // 模块字段统一从分组上下文解析相对路径
  const moduleContext = moduleConfig.context?.length
    ? createDataPathContext(moduleConfig.context)
    : undefined;

  for (const field of moduleConfig.fields) {
    if (field.type === "array" && field.itemSchema) {
      const itemSchema = field.itemSchema;
      const itemDefs = itemSchema.fields?.length ? itemSchema.fields : itemSchema.model;
      if (!itemDefs?.length) continue;

      const parentRequired = itemSchema.required === true || field.required === true;

      const listPath = getArrayDataPath(field, moduleContext) || [];
      const list = getValueByPath(rootData, listPath);

      if (!Array.isArray(list) || list.length === 0) {
        let hasRequired = false;
        for (const def of itemDefs) {
          const isRequired = def.required === true || parentRequired;
          if (!isRequired) continue;
          hasRequired = true;
          total += 1;
          const { prop } = getFieldMeta(def);
          const label = getLabel(def, prop);
          if (!missing.includes(label)) missing.push(label);
        }
        if (hasRequired) {
          const groupLabel = getFieldLabel(itemSchema) || $t("content");
          if (!missing.includes(groupLabel)) missing.push(groupLabel);
        }
        continue;
      }

      list.forEach((_: any, idx: number) => {
        for (const def of itemDefs) {
          const isRequired = def.required === true || parentRequired;
          if (!isRequired) continue;
          const { src, prop } = getFieldMeta(def);
          if (!src.length) continue;

          // 数组子项字段基于当前记录上下文解析为完整数据路径
          const path = resolveDataPath(src, { basePath: listPath, index: idx });
          const value = getValueByPath(rootData, path);

          // 修改：使用 src 最后一个元素判断是否为 content
          const filled =
            src[src.length - 1] === "content" ? !isContentEmpty(value) : !isEmpty(value);

          total += 1;
          if (filled) {
            done += 1;
          } else {
            const label = getLabel(def, prop);
            if (!missing.includes(label)) missing.push(label);
          }
        }
      });
      continue;
    }

    // 字段被包裹组件包裹时，必填与数据路径以内层字段为准
    const target = unwrapField(field) ?? field;
    if (target?.required !== true) continue;
    const { src, prop } = getFieldMeta(target);
    if (!src.length) continue;

    const value = getValueByPath(rootData, resolveDataPath(src, moduleContext));

    // 修改：使用 src 最后一个元素判断是否为 content
    const filled = src[src.length - 1] === "content" ? !isContentEmpty(value) : !isEmpty(value);

    total += 1;
    if (filled) {
      done += 1;
    } else {
      const label = target.component === "wangEditor" ? "内容" : getLabel(field, prop);
      if (!missing.includes(label)) missing.push(label);
    }
  }

  const score = total ? Math.round((done / total) * 10) : 0;
  return { missing, score };
}

// ==================== 时间线一致性检查 ====================

const GAP_THRESHOLD_MONTHS = 6;

const parseMonth = (str: any) => {
  if (typeof str !== "string") return null;
  const match = str.match(/^(\d{4})\.(\d{1,2})$/);
  if (!match) return null;
  return Number(match[1]) * 12 + Number(match[2]);
};

// 当前月份，与 parseMonth 同为"年 * 12 + 月"的数值
const currentMonth = () => {
  const now = new Date();
  return now.getFullYear() * 12 + now.getMonth() + 1;
};

const formatGap = (months: number) => {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years && rest) return $t("gapYearsMonths", { years, months: rest });
  if (years) return $t("gapYears", { years });
  return $t("gapMonths", { months: rest });
};

function checkTimeline(modules: Array<{ key: string; config: any }>, rootData: any) {
  const issuesList: any[] = [];

  for (const { key, config } of modules) {
    const arrayField = config.fields?.find((field: any) => field.type === "array");
    const moduleContext = config.context?.length
      ? createDataPathContext(config.context)
      : undefined;
    const listPath = getArrayDataPath(arrayField, moduleContext) || [];
    // 时间线记录统一按数组容器声明的数据源读取
    const items = getValueByPath(rootData, listPath);
    if (!Array.isArray(items) || !items.length) continue;

    let startTimePath: string[] = [];
    let endTimePath: string[] = [];
    walkFormFields(config.fields, (field) => {
      const binding = getModelBindings(field)[0];
      if (field.type !== "object" || !binding?.source) return;
      // 时间线只关注记录内的开始时间与结束时间字段
      const fieldKey = binding.source[binding.source.length - 1];
      if (fieldKey === "startTime") startTimePath = binding.source;
      if (fieldKey === "endTime") endTimePath = binding.source;
    });
    if (!startTimePath.length) continue;

    const entries = items
      .map((item: any, index: number) => {
        const startValue = getValueByPath(
          rootData,
          resolveDataPath(startTimePath, { basePath: listPath, index }),
        );
        const endValue = endTimePath.length
          ? getValueByPath(rootData, resolveDataPath(endTimePath, { basePath: listPath, index }))
          : null;
        const start = parseMonth(startValue);
        // 结束时间为"至今"时按当前月参与计算，缺省时沿用开始时间
        const end = endValue === "至今" ? currentMonth() : (parseMonth(endValue) ?? start);
        return { item, index, name: item?.data?.name || "", start, end };
      })
      .filter((e: any) => e.start != null && e.end != null);

    if (!entries.length) continue;

    const sorted = [...entries].sort((a: any, b: any) => a.start - b.start);
    const issues: any[] = [];

    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1].start - sorted[i].end;
      if (gap > GAP_THRESHOLD_MONTHS) {
        issues.push({
          type: "gap",
          text: $t("timelineGapMessage", {
            current: sorted[i + 1].name || $t("unnamed"),
            previous: sorted[i].name || $t("unnamed"),
            gap: formatGap(gap),
          }),
        });
      }
    }

    if (issues.length) {
      issuesList.push({
        key,
        name: getModuleTitle(config, rootData, key),
        issues,
      });
    }
  }

  return {
    list: issuesList,
    issueCount: issuesList.reduce((total, m) => total + m.issues.length, 0),
  };
}

// ==================== useProgress ====================

export function useProgress(
  fields: MaybeRefOrGetter<any[]>,
  data: MaybeRefOrGetter<Record<string, any>>,
) {
  const fieldsList = toValue(fields) || [];
  const rootData = toValue(data) || {};

  const moduleMap = new Map<string, any>();
  for (const f of fieldsList) {
    if (f?.key) moduleMap.set(f.key, f);
  }

  const progressItems: Array<{
    key: string;
    name: string;
    progress: number;
    allProgress: 100;
    missing: string[];
  }> = [];
  let totalScore = 0;
  const timelineModules: Array<{ key: string; config: any }> = [];

  for (const [key, config] of moduleMap) {
    const { missing, score } = analyzeModule(config, rootData);
    const progress = score * 10;
    progressItems.push({
      key,
      name: getModuleTitle(config, rootData, key),
      progress,
      allProgress: 100,
      missing,
    });
    totalScore += progress;

    if (config.fields?.some((f: any) => f.type === "array" && f.itemSchema)) {
      timelineModules.push({ key, config });
    }
  }

  const totalFull = progressItems.length * 100;
  const totalProgress = totalFull ? Math.round((totalScore / totalFull) * 100) : 0;
  const timeline = checkTimeline(timelineModules, rootData);

  return {
    list: progressItems,
    totalScore,
    totalFull,
    progress: totalProgress,
    timeline,
  };
}
