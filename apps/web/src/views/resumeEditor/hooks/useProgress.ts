import { toValue, type MaybeRefOrGetter } from "vue";

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
  if (typeof val !== "string") return false;
  return val === "<p><br></p>";
};

const getLabel = (field: any, prop: string): string =>
  field?.label || field?.name || prop || "字段";

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

  for (const field of moduleConfig.fields) {
    if (field.type === "array" && field.addConfig) {
      const addConfig = field.addConfig;
      const itemDefs = addConfig.fields?.length ? addConfig.fields : addConfig.model;
      if (!itemDefs?.length) continue;

      const parentRequired = addConfig.required === true || field.required === true;

      const firstSrc = getFieldMeta(itemDefs[0]).src;
      const listPath = firstSrc.slice(0, firstSrc.indexOf("?"));
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
          const groupLabel = addConfig.name || "内容";
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

          const path = src.map((k) => (k === "?" ? idx : k));
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

    if (field.required !== true) continue;
    const { src, prop } = getFieldMeta(field);
    if (!src.length) continue;

    const value = getValueByPath(rootData, src);

    // 修改：使用 src 最后一个元素判断是否为 content
    const filled = src[src.length - 1] === "content" ? !isContentEmpty(value) : !isEmpty(value);

    total += 1;
    if (filled) {
      done += 1;
    } else {
      const label = field.component === "wangEditor" ? "内容" : getLabel(field, prop);
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

const formatGap = (months: number) => {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years && rest) return `${years}年${rest}个月`;
  if (years) return `${years}年`;
  return `${rest}个月`;
};

function checkTimeline(modules: Array<{ key: string; config: any }>, rootData: any) {
  const issuesList: any[] = [];

  for (const { key, config } of modules) {
    const moduleData = rootData[key];
    const items = Array.isArray(moduleData?.data) ? moduleData.data : [];
    if (!items.length) continue;

    let timeFieldPath: string[] = [];
    const findTimeField = (fields: any[]) => {
      for (const f of fields) {
        if (f.type === "object" && f.component === "datePicker" && f.model?.source) {
          if (f.props?.type === "monthrange") {
            timeFieldPath = f.model.source;
            return true;
          }
        }
        if (f.fields) {
          if (findTimeField(f.fields)) return true;
        }
        if (f.addConfig?.fields) {
          if (findTimeField(f.addConfig.fields)) return true;
        }
      }
      return false;
    };
    findTimeField(config.fields || []);
    if (!timeFieldPath.length) continue;

    const entries = items
      .map((item: any, index: number) => {
        const path = timeFieldPath.map((k) => (k === "?" ? index : k));
        const time = getValueByPath(rootData, path) || [];
        const start = parseMonth(time[0]);
        const end = parseMonth(time[1] ?? time[0]);
        return { item, index, name: item?.name || "", time, start, end };
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
          text: `「${sorted[i + 1].name || "未命名"}」与上一段「${sorted[i].name || "未命名"}」之间存在 ${formatGap(gap)} 空档，可考虑补充或说明`,
        });
      }
    }

    if (issues.length) {
      issuesList.push({
        key,
        name: config.props?.name || key,
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
      name: config.props?.name || key,
      progress,
      allProgress: 100,
      missing,
    });
    totalScore += progress;

    if (config.fields?.some((f: any) => f.type === "array" && f.addConfig)) {
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
