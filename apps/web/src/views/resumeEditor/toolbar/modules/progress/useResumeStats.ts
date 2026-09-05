// resume-stats.ts
import { computed, isRef } from "vue";

/**
 * 剔除 HTML 标签及常见实体
 */
function stripHtml(html: string): string {
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

/**
 * 递归收集文本（跳过 avatar/collapsed/hidden/status/img，content 剥离 HTML）
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
      // 图片等属性仅作展示，不参与文本统计，跳过
      if (["avatar", "collapsed", "hidden", "status", "img"].includes(key)) continue;
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
    if (!("data" in module)) continue; // 只处理有 .data 的模块

    const moduleData = module.data;
    const texts: string[] = [];

    // 提取该模块 .data 下的所有文本
    if (typeof moduleData === "string") {
      const cleaned = stripHtml(moduleData);
      if (cleaned) texts.push(cleaned);
    } else if (Array.isArray(moduleData)) {
      for (const item of moduleData) {
        collectTexts(item, texts);
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
