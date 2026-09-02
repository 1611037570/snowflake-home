/**
 * 剔除字符串中的 HTML 标签，并转换常见 HTML 实体
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
 * 递归收集对象中的所有文本（跳过元数据字段，并针对 content 字段剥离 HTML）
 */
function collectTexts(obj: unknown, result: string[]): void {
  if (typeof obj === "string") {
    if (obj.trim()) result.push(obj.trim());
    return;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      collectTexts(item, result);
    }
    return;
  }

  if (obj && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      // 跳过非内容字段
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

/**
 * 统计结果结构
 */
export interface StatsResult {
  total: number; // 总字符数（不含空格）
  chinese: number; // 中文字符数
  english: number; // 英文字母数
  digits: number; // 数字字符数
  spaces: number; // 空格数
  punctuation: number; // 标点符号数（总字符 - 中文 - 英文 - 数字 - 空格）
}

/**
 * 主统计函数（Hook 风格命名）：只统计各个模块的 .data 字段，过滤 avatar 等无关信息
 * @param data 原始简历数据对象（如您提供的 JSON）
 * @returns 统计结果
 */
export function useResumeStats(data: Record<string, any>): StatsResult {
  const allTexts: string[] = [];

  // 遍历顶层模块
  for (const key of Object.keys(data)) {
    const module = data[key];
    if (!module || typeof module !== "object") continue;

    // 只处理存在 .data 的模块（忽略 user 等）
    if (!("data" in module)) continue;

    const moduleData = module.data;

    // 处理三种情况：字符串、数组、对象
    if (typeof moduleData === "string") {
      const cleaned = stripHtml(moduleData);
      if (cleaned) allTexts.push(cleaned);
    } else if (Array.isArray(moduleData)) {
      for (const item of moduleData) {
        collectTexts(item, allTexts);
      }
    } else if (moduleData && typeof moduleData === "object") {
      collectTexts(moduleData, allTexts);
    }
  }

  const full = allTexts.join("");
  const total = full.length;
  const chinese = (full.match(/[\u4e00-\u9fa5]/g) || []).length;
  const english = (full.match(/[a-zA-Z]/g) || []).length;
  const digits = (full.match(/[0-9]/g) || []).length;
  const spaces = (full.match(/\s/g) || []).length;
  const punctuation = total - chinese - english - digits - spaces;

  return { total, chinese, english, digits, spaces, punctuation };
}
