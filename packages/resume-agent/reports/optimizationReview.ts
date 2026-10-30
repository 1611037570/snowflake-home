import { richTextToPlainText } from "@snowflake/resume-core";
import type { ResumeAgentTaskEvidence } from "../runtime/taskTypes";
import type { ReportChange, ResumeReport } from "./resumeReport";

type DataView = Record<string, {
  title?: string; // 实际读取到的模块名称。
  data?: unknown; // 去除界面状态与媒体后的业务内容。
}>;

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown): string => typeof value === "string" ? value.trim() : "";
const strings = (value: unknown): string[] => Array.isArray(value) ? value.map(text).filter(Boolean) : [];
const plain = (value: unknown): string => {
  if (typeof value === "string") return richTextToPlainText(value).trim();
  if (Array.isArray(value)) return value.map(plain).filter(Boolean).join("；");
  if (isObject(value)) return Object.values(value).map(plain).filter(Boolean).join("；");
  return typeof value === "number" ? String(value) : "";
};

// 报告只是说明，不让代码围栏、维度顺序或缺少字段使已完成的内容优化失败。
const readReport = (content: string): Record<string, unknown> => {
  const candidates = [content.trim(), ...Array.from(content.matchAll(/```(?:json|resume-report)?\s*\n([\s\S]*?)\n```/g), (match) => match[1]!)];
  for (const candidate of candidates) {
    try { const value = JSON.parse(candidate); if (isObject(value)) return value; }
    catch { /* 格式不可用时由实际草稿变化整理报告，不追加模型返工。 */ }
  }
  return {};
};

// 找到实际变化的字段，原文与改后摘录由程序生成，不要求模型逐字抄写。
const findChange = (before: unknown, after: unknown): [string, string] | null => {
  if (JSON.stringify(before) === JSON.stringify(after)) return null;
  if ((isObject(before) || Array.isArray(before)) && (isObject(after) || Array.isArray(after))) {
    for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
      const change = findChange((before as Record<string, unknown>)[key], (after as Record<string, unknown>)[key]);
      if (change) return change;
    }
  }
  return [plain(before), plain(after)];
};

const excerpts = ([before, after]: [string, string]): [string, string] => {
  let prefix = 0;
  while (prefix < Math.min(before.length, after.length) && before[prefix] === after[prefix]) prefix += 1;
  const start = Math.max(0, prefix - 48);
  return [before.slice(start, start + 180), after.slice(start, start + 180)];
};

const DIMENSIONS = ["信息完整度", "阅读效率", "职业契合度", "职业成就", "发展潜力", "职业稳定性"];

// 实际改动以最终数据差异为准；模型只补充原因、建议与可用评分，不能伪造改动。
export const buildOptimizationReport = (
  content: string,
  evidence: ResumeAgentTaskEvidence[],
  originalData: unknown,
  finalData: unknown,
  completed: boolean,
): ResumeReport => {
  const before: DataView = isObject(originalData) ? originalData as DataView : {};
  const after: DataView = isObject(finalData) ? finalData as DataView : {};
  const value = readReport(content);
  const proposed = Array.isArray(value.changes) ? value.changes.filter(isObject) : [];
  const verified = evidence.filter((item) => item.changed === true && item.status !== "failed" && !item.replayed)
    .flatMap((item) => item.verifiedChanges ?? []);
  const changes: ReportChange[] = [];
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const changed = findChange(before[key]?.data, after[key]?.data);
    if (!changed) continue;
    const module = after[key]?.title || before[key]?.title || key;
    const explanation = proposed.find((item) => item.module === module || item.module === key);
    const [oldText, newText] = excerpts(changed);
    changes.push({
      module, // 真实发生最终变化的模块。
      summary: text(explanation?.summary) || [...new Set(verified.filter((item) => item.module === module).map((item) => item.summary))].join("；") || "已调整该模块内容", // 优先使用对应模块的说明。
      problem: text(explanation?.problem) || undefined, // 可用的模型问题分析。
      benefit: text(explanation?.benefit) || undefined, // 可用的模型改善说明。
      before: oldText, // 程序提取的原文片段。
      after: newText, // 程序提取的最终草稿片段。
    });
  }
  const dimensions = DIMENSIONS.map((name) => {
    const dimension = Array.isArray(value.dimensions) ? value.dimensions.find((item) => isObject(item) && item.name === name) : undefined;
    const score = isObject(dimension) ? dimension.score : null;
    return {
      name, // 展示维度按前端约定排列，模型无需保持顺序。
      score: completed && typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 100 ? Math.round(score) : null, // 不完整或无依据的评分不展示为零分。
    };
  });
  const scores = dimensions.flatMap((item) => item.score == null ? [] : [item.score]);
  const todo = strings(value.todo);
  // 候选内容沿用共用写作规则，但必须提醒用户核实，不能冒充已确认事实。
  if (/(?:^|[^A-Z])XX(?=[^A-Z]|$)/.test(plain(after))) {
    todo.unshift("草稿包含 XX 待补充内容，保存前请逐项替换并核实相关职责、方法和成果。");
  }
  return {
    summary: !completed ? `已保留 ${changes.length} 个模块的部分修改，尚未完成整份简历优化。` : text(value.summary) || (changes.length ? `已整理 ${changes.length} 个模块的实际修改，请查看优化前后效果。` : "已检查当前简历，本轮没有产生内容修改。"), // 部分结果使用真实状态，不沿用模型的完成宣称。
    totalScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null, // 只按有效维度计算。
    dimensions, // 缺少评分时仍能展示实际改动。
    changes, // 真实原文与最终草稿产生的改动。
    checks: Array.isArray(value.checks) ? value.checks.filter(isObject).filter((item) => text(item.message)).map((item) => ({
      level: item.level === "error" ? "error" : "warning", // 未识别的级别按提醒展示。
      message: text(item.message), // 模型指出的剩余问题。
    })) : [],
    todo: [...new Set(todo)], // 去重后的待核实内容。
    highlights: changes.length ? strings(value.highlights) : [], // 没有实际改动时不宣称优化亮点。
    suggestions: strings(value.suggestions), // 剩余行动建议。
  };
};
