// resume-stats.ts
import { computed, isRef } from "vue";

/**
 * 剔除 HTML 标签及常见实体
 */
export function stripHtml(html: string): string {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(
      /&lt;|&gt;|&amp;|&quot;|&#39;|&nbsp;/g,
      (m) =>
        ({
          "&lt;": "<",
          "&gt;": ">",
          "&amp;": "&",
          "&quot;": '"',
          "&#39;": "'",
          "&nbsp;": " ",
        })[m] || m,
    )
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// 文本统计忽略字段及原因：
// avatar：头像媒体，仅展示不计入正文
// img：图片作品媒体，仅展示不计入正文
// status：求职状态枚举，有独立字段管理，不计入正文文本
// collapsed：模块/记录折叠 UI 状态
// hidden：模块显隐 UI 状态
const SKIP_TEXT_FIELDS = ["avatar", "img", "status", "collapsed", "hidden"];

/**
 * 递归收集文本（content 剥离 HTML），跳过非内容字段
 */
function collectTexts(obj: unknown, result: string[]): void {
  if (typeof obj === "string") {
    if (obj.trim()) result.push(obj.trim());
    return;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) collectTexts(item, result);
    return;
  }
  if (obj && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      if (SKIP_TEXT_FIELDS.includes(key)) continue;
      if (key === "content" && typeof value === "string") {
        const cleaned = stripHtml(value);
        if (cleaned) result.push(cleaned);
      } else {
        collectTexts(value, result);
      }
    }
  }
}

/** 单个模块的统计 */
export interface ModuleStats {
  total: number;
  chinese: number;
  english: number;
  digits: number;
  spaces: number;
  punctuation: number;
}

/** 返回结构：键为模块名，外加一个 'total' 汇总 */
export interface ResumeStats {
  [moduleName: string]: ModuleStats;
  total: ModuleStats;
}

/**
 * 纯计算函数，用于统计
 */
function computeStats(data: any): ResumeStats {
  const result: ResumeStats = {} as ResumeStats;
  const totalStats: ModuleStats = {
    total: 0,
    chinese: 0,
    english: 0,
    digits: 0,
    spaces: 0,
    punctuation: 0,
  };

  for (const key of Object.keys(data)) {
    const module = data[key];
    if (!module || typeof module !== "object") continue;
    if (!("data" in module || "list" in module)) continue;

    // 对象模块只有 data，数组模块记录只在 list
    const moduleData = module.list ?? module.data;
    const texts: string[] = [];

    if (Array.isArray(moduleData)) {
      for (const item of moduleData) {
        collectTexts(item?.data, texts);
      }
    } else if (moduleData && typeof moduleData === "object") {
      collectTexts(moduleData, texts);
    }

    const full = texts.join("");
    const total = full.length;
    const chinese = (full.match(/[\u4e00-\u9fa5]/g) || []).length;
    const english = (full.match(/[a-zA-Z]/g) || []).length;
    const digits = (full.match(/[0-9]/g) || []).length;
    const spaces = (full.match(/\s/g) || []).length;
    const punctuation = total - chinese - english - digits - spaces;

    const modStats: ModuleStats = { total, chinese, english, digits, spaces, punctuation };
    result[key] = modStats;

    totalStats.total += total;
    totalStats.chinese += chinese;
    totalStats.english += english;
    totalStats.digits += digits;
    totalStats.spaces += spaces;
    totalStats.punctuation += punctuation;
  }

  result.total = totalStats;
  return result;
}

export function useResumeStats(data: any) {
  return computed(() => {
    const rawData = isRef(data) ? data.value : data;
    return computeStats(rawData);
  });
}

/**
 * 是否存在正文文本：命中第一处非空文本即返回，避免为判空遍历整份简历
 */
function hasText(obj: unknown): boolean {
  if (typeof obj === "string") return Boolean(obj.trim());
  if (Array.isArray(obj)) return obj.some(hasText);
  if (obj && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      if (SKIP_TEXT_FIELDS.includes(key)) continue;
      if (key === "content" && typeof value === "string") {
        if (stripHtml(value)) return true;
      } else if (hasText(value)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 轻量判空：按 computeStats 相同的字段口径扫描模块，命中文本即可提前结束
 */
export function isEmptyResume(data: any): boolean {
  if (!data || typeof data !== "object") return true;
  for (const key of Object.keys(data)) {
    const module = data[key];
    if (!module || typeof module !== "object") continue;
    if (!("data" in module || "list" in module)) continue;
    // 对象模块只有 data，数组模块记录只在 list
    const moduleData = module.list ?? module.data;
    if (Array.isArray(moduleData)) {
      if (moduleData.some((item) => hasText(item?.data))) return false;
    } else if (hasText(moduleData)) {
      return false;
    }
  }
  return true;
}
