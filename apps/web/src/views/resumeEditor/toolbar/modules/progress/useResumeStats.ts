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
 * 递归收集文本（跳过 avatar/collapsed/hidden/status，content 剥离 HTML）
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
      if (["avatar", "collapsed", "hidden", "status"].includes(key)) continue;
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
 * 统计简历数据（仅统计各模块的 .data 字段）
 * @param data 原始简历 JSON
 * @returns 各模块统计 + 总计
 */
export function useResumeStats(data: Record<string, any>): ResumeStats {
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

    // 计算该模块的统计
    const full = texts.join("");
    const total = full.length;
    const chinese = (full.match(/[\u4e00-\u9fa5]/g) || []).length;
    const english = (full.match(/[a-zA-Z]/g) || []).length;
    const digits = (full.match(/[0-9]/g) || []).length;
    const spaces = (full.match(/\s/g) || []).length;
    const punctuation = total - chinese - english - digits - spaces;

    const modStats: ModuleStats = { total, chinese, english, digits, spaces, punctuation };
    result[key] = modStats;

    // 累加到总计
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
