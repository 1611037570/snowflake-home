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

// 可添加字段只有数据路径已创建后才进入完成度和 ATS 统计。
const hasDataPath = (obj: any, path: (string | number)[]): boolean => {
  let cur = obj;
  for (const key of path) {
    if (cur == null || !Object.prototype.hasOwnProperty.call(cur, key)) return false;
    cur = cur[key];
  }
  return true;
};

const isEmpty = (val: any): boolean =>
  val == null ||
  (typeof val === "string" && val.trim() === "") ||
  (Array.isArray(val) && val.length === 0) ||
  (typeof val === "object" && !Array.isArray(val) && Object.keys(val).length === 0);

// 复合可选字段的子项全空时不参与格式检查。
const isDeepEmpty = (val: any): boolean =>
  isEmpty(val) ||
  (Array.isArray(val) && val.every(isDeepEmpty)) ||
  (typeof val === "object" && !Array.isArray(val) && Object.values(val).every(isDeepEmpty));

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

// 完成度只把字段校验规则中明确标记必填的项计入。
const isRequiredField = (field: any): boolean =>
  field?.rules?.some((rule: any) => rule?.required === true) === true;

const getRuleIssues = (rules: any[], value: unknown, label: string) => {
  if (isDeepEmpty(value)) return [];
  return rules.flatMap((rule) => {
    if (rule?.pattern instanceof RegExp) {
      if (typeof value !== "string" && typeof value !== "number") return [];
      rule.pattern.lastIndex = 0;
      return rule.pattern.test(String(value))
        ? []
        : [{ label, message: rule.message || $t("invalidFormat"), severity: "error" }];
    }

    const atsRule = rule?.ats;
    if (!atsRule?.type) return [];
    const addIssue = (message: string, issueLabel = label) => [
      { label: issueLabel, message, severity: atsRule.severity || "warning" },
    ];
    if (atsRule.type === "wechat") {
      return /^[a-zA-Z][-_a-zA-Z0-9]{5,19}$/.test(String(value))
        ? []
        : addIssue($t("atsWechatFormat"));
    }
    if (["url", "projectLink", "socialLink"].includes(atsRule.type)) {
      const urlValue =
        typeof value === "string"
          ? value
          : value && typeof value === "object"
            ? value.url
            : "";
      if (!urlValue) {
        const hasLinkName = value && typeof value === "object" && !isDeepEmpty(value.name);
        return hasLinkName ? addIssue($t("atsLinkRequired")) : [];
      }
      const input = String(urlValue).trim();
      try {
        const normalized = /^[a-z][a-z\d+.-]*:\/\//i.test(input) ? input : `https://${input}`;
        const parsed = new URL(normalized);
        return ["http:", "https:"].includes(parsed.protocol) && parsed.hostname.includes(".")
          ? []
          : addIssue($t("atsUrlFormat"));
      } catch {
        return addIssue($t("atsUrlFormat"));
      }
    }
    if (atsRule.type === "numberFields") {
      return (atsRule.fields ?? []).flatMap((field: any) => {
        const fieldValue = value?.[field.key];
        if (isDeepEmpty(fieldValue)) return [];
        const normalized = String(fieldValue).trim().replace(/\s*(cm|kg|厘米|公斤)$/i, "");
        const number = Number(normalized);
        return Number.isFinite(number) && number >= field.min && number <= field.max
          ? []
          : addIssue($t("atsNumberRange", { min: field.min, max: field.max }), $t(field.label));
      });
    }
    if (atsRule.type === "salaryRange") {
      const match = String(value).match(/^(\d+(?:\.\d+)?)k-(?:(\d+(?:\.\d+)?)k)?$/i);
      const above = String(value).match(/^(\d+(?:\.\d+)?)k以上$/i);
      if (above) return Number(above[1]) > 0 ? [] : addIssue($t("atsSalaryRange"));
      if (!match || Number(match[1]) <= 0) return addIssue($t("atsSalaryRange"));
      if (match[2] && Number(match[2]) <= Number(match[1])) return addIssue($t("atsSalaryOrder"));
      return [];
    }
    if (atsRule.type === "contentQuality") {
      if (isContentEmpty(String(value))) return [];
      const content = String(value)
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;|&#160;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (/待补充|待完善|请填写|TODO|TBD|XXX/i.test(content)) {
        return addIssue($t("atsPlaceholderContent"));
      }
      return Array.from(content).length < 20 ? addIssue($t("atsContentTooShort")) : [];
    }
    return [];
  });
};

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
    return { missing: [], issues: [], score: 0 };
  }

  const missing: string[] = [];
  const issues: Array<{ label: string; message: string; severity?: "error" | "warning" }> = [];
  let done = 0;
  let total = 0;
  // 模块字段统一从分组上下文解析相对路径
  const moduleContext = moduleConfig.context?.length
    ? createDataPathContext(moduleConfig.context)
    : undefined;
  const moduleFields: Array<{ field: any; inheritedRules: any[]; inheritedLabel?: string }> = [];
  const collectModuleFields = (
    fields: any[],
    inheritedRules: any[] = [],
    inheritedLabel?: string,
  ) => {
    for (const candidate of fields) {
      if (candidate.type === "group") {
        collectModuleFields(
          candidate.fields ?? [],
          [...inheritedRules, ...(candidate.rules ?? [])],
          candidate.props?.label || inheritedLabel,
        );
      } else {
        moduleFields.push({ field: candidate, inheritedRules, inheritedLabel });
      }
    }
  };
  // 展开个人信息等包裹组，让其中的动态字段也参与 ATS 检查。
  collectModuleFields(moduleConfig.fields);

  for (const { field, inheritedRules, inheritedLabel } of moduleFields) {
    if (field.type === "array" && field.itemSchema) {
      const itemSchema = field.itemSchema;
      const parentRequired =
        inheritedRules.some((rule) => rule?.required === true) ||
        isRequiredField(itemSchema) ||
        isRequiredField(field);
      const itemDefs: Array<{ field: any; target: any; required: boolean }> = [];
      const collectItemFields = (fields: any[], inheritedRequired: boolean) => {
        for (const candidate of fields) {
          const required = inheritedRequired || isRequiredField(candidate);
          if (candidate.type === "group") {
            collectItemFields(candidate.fields ?? [], required);
            continue;
          }
          const target = unwrapField(candidate) ?? candidate;
          itemDefs.push({
            field: candidate,
            target,
            required: required || isRequiredField(target),
          });
        }
      };
      if (itemSchema.fields?.length) {
        collectItemFields(itemSchema.fields, parentRequired);
      } else {
        const bindings = Array.isArray(itemSchema.model)
          ? itemSchema.model
          : itemSchema.model
            ? [itemSchema.model]
            : [];
        for (const binding of bindings) {
          itemDefs.push({
            field: binding,
            target: binding,
            required: parentRequired || isRequiredField(binding),
          });
        }
      }
      if (!itemDefs.length) continue;

      const listPath = getArrayDataPath(field, moduleContext) || [];
      const list = getValueByPath(rootData, listPath);

      if (!Array.isArray(list) || list.length === 0) {
        let hasRequired = false;
        for (const def of itemDefs) {
          if (!def.required) continue;
          hasRequired = true;
          total += 1;
          const { prop } = getFieldMeta(def.target);
          const label = getLabel(def.field, prop);
          if (!missing.includes(label)) missing.push(label);
        }
        if (hasRequired) {
          const groupLabel = getFieldLabel(itemSchema) || $t("content");
          if (!missing.includes(groupLabel)) missing.push(groupLabel);
        }
        continue;
      }

      list.forEach((_: any, idx: number) => {
        issues.push(
          ...getRuleIssues(
            itemSchema.rules ?? [],
            { name: list[idx]?.data?.name, url: list[idx]?.data?.url },
            `${getFieldLabel(itemSchema) || $t("socialAccounts")} · ${$t("recordIndex", { index: idx + 1 })}`,
          ),
        );
        for (const def of itemDefs) {
          const { src, prop } = getFieldMeta(def.target);
          if (!src.length) continue;

          // 数组子项字段基于当前记录上下文解析为完整数据路径
          const path = resolveDataPath(src, { basePath: listPath, index: idx });
          const value = getValueByPath(rootData, path);

          const rules = [
            ...(def.field.rules ?? []),
            ...(def.target === def.field ? [] : (def.target.rules ?? [])),
          ];
          issues.push(
            ...getRuleIssues(
              rules,
              value,
              `${getLabel(def.field, prop)} · ${$t("recordIndex", { index: idx + 1 })}`,
            ),
          );
          if (!def.required) continue;

          // 修改：使用 src 最后一个元素判断是否为 content
          const filled =
            src[src.length - 1] === "content" ? !isContentEmpty(value) : !isEmpty(value);

          total += 1;
          if (filled) {
            done += 1;
          } else {
            const label = getLabel(def.field, prop);
            if (!missing.includes(label)) missing.push(label);
          }
        }
      });
      continue;
    }

    // 字段被包裹组件包裹时，必填与数据路径以内层字段为准
    const target = unwrapField(field) ?? field;
    const { src, prop } = getFieldMeta(target);
    if (!src.length) continue;

    const resolvedPath = resolveDataPath(src, moduleContext);
    if ((field.addable || target.addable) && !hasDataPath(rootData, resolvedPath)) continue;
    const value = getValueByPath(rootData, resolvedPath);
    const rules = [
      ...inheritedRules,
      ...(field.rules ?? []),
      ...(target === field ? [] : (target.rules ?? [])),
    ];
    const fieldLabel = getFieldLabel(field) || inheritedLabel || prop || $t("field");
    issues.push(...getRuleIssues(rules, value, fieldLabel));
    const required =
      inheritedRules.some((rule) => rule?.required === true) ||
      isRequiredField(target) ||
      isRequiredField(field);
    if (!required) continue;

    // 修改：使用 src 最后一个元素判断是否为 content
    const filled = src[src.length - 1] === "content" ? !isContentEmpty(value) : !isEmpty(value);

    total += 1;
    if (filled) {
      done += 1;
    } else {
      const label = ["wangEditor", "resumeContentEditor"].includes(target.component)
        ? "内容"
        : fieldLabel;
      if (!missing.includes(label)) missing.push(label);
    }
  }

  const score = total ? Math.round((done / total) * 10) : 0;
  const uniqueIssues = [
    ...new Map(issues.map((issue) => [`${issue.label}:${issue.message}`, issue])).values(),
  ];
  return { missing, issues: uniqueIssues, score };
}

// ==================== 时间线一致性检查 ====================

const GAP_THRESHOLD_MONTHS = 6;

const parseMonth = (str: any) => {
  if (typeof str !== "string") return null;
  const match = str.match(/^(\d{4})\.(0[1-9]|1[0-2])$/);
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

    const sorted = entries.filter((entry: any) => entry.end >= entry.start).sort((a: any, b: any) => a.start - b.start);
    const issues: any[] = [];

    for (const entry of entries) {
      const entryLabel = `${entry.name || $t("unnamed")} · ${$t("recordIndex", { index: entry.index + 1 })}`;
      if (entry.start > entry.end) {
        issues.push({ type: "range", text: $t("timelineRangeMessage", { entry: entryLabel }) });
      }
      if (
        ["work", "project"].includes(key) &&
        (entry.start > currentMonth() || entry.end > currentMonth())
      ) {
        issues.push({ type: "future", text: $t("timelineFutureMessage", { entry: entryLabel }) });
      }
    }

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
    issues: Array<{ label: string; message: string }>;
  }> = [];
  let totalScore = 0;
  const timelineModules: Array<{ key: string; config: any }> = [];

  for (const [key, config] of moduleMap) {
    const { missing, issues, score } = analyzeModule(config, rootData);
    const progress = score * 10;
    progressItems.push({
      key,
      name: getModuleTitle(config, rootData, key),
      progress,
      allProgress: 100,
      missing,
      issues,
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
