// 一键优化报告数据结构与解析工具：协调编排技能输出与前端面板渲染
import type { ResumeAgentTaskEvidence } from "../runtime/taskTypes";
export interface ReportDimension {
  // 固定评分维度名称
  name: string;
  // 百分制整数分，不适用或无依据时为空
  score: number | null;
}

export interface ReportCheck {
  // 问题严重程度
  level: "error" | "warning";
  // 有简历证据的问题说明
  message: string;
}

export interface ReportChange {
  // 实际发生修改的模块展示名称
  module: string;
  // 实际成功改动的简要说明
  summary: string;
}

// 一键优化产出的结构化报告，字段与按钮任务配置的输出约定保持一致
export interface ResumeReport {
  // 有效维度得分均值，无可评分维度时为空
  totalScore: number | null;
  // 六个固定维度及其评分
  dimensions: ReportDimension[];
  // 优化后仍存在的问题
  checks: ReportCheck[];
  // 本轮实际完成的改动
  changes: ReportChange[];
  // 需要用户补充的事实
  todo: string[];
  // 有依据的优化亮点
  highlights: string[];
  // 尚未解决问题的行动建议
  suggestions: string[];
}

// 评分顺序与技能约定一致，拒绝缺失、重复或臆造维度
const DIMENSION_NAMES = [
  "信息完整度", "阅读效率", "职业契合度", "职业成就", "发展潜力", "职业稳定性",
];
const isScore = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 100;
const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

// 校验完整报告并按有效维度重算总分，缺失的可选清单兼容为空数组
const normalizeReport = (value: unknown): ResumeReport | null => {
  if (!isObject(value) || !(value.totalScore === null || isScore(value.totalScore))) return null;
  const dimensions = value.dimensions;
  if (!Array.isArray(dimensions) || dimensions.length !== DIMENSION_NAMES.length) return null;
  if (!dimensions.every((item, index) => isObject(item) &&
    item.name === DIMENSION_NAMES[index] && (item.score === null || isScore(item.score)))) return null;
  const checks = value.checks ?? [];
  const changes = value.changes ?? [];
  const todo = value.todo ?? [];
  const highlights = value.highlights ?? [];
  const suggestions = value.suggestions ?? [];
  if (!Array.isArray(checks) || !checks.every((item) => isObject(item) &&
    ["error", "warning"].includes(String(item.level)) && typeof item.message === "string")) return null;
  if (!Array.isArray(changes) || !changes.every((item) => isObject(item) &&
    typeof item.module === "string" && typeof item.summary === "string")) return null;
  if (![todo, highlights, suggestions].every(isStringList)) return null;
  const scores = dimensions.map((item) => item.score).filter(isScore);
  return {
    // 根据校验后的有效分数计算，避免模型总分与维度不一致
    totalScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null,
    // 校验后保留固定顺序的维度
    dimensions: dimensions as ReportDimension[],
    // 校验后的问题清单
    checks: checks as ReportCheck[],
    // 校验后的实际改动清单
    changes: changes as ReportChange[],
    // 兼容旧报告缺失的待补充清单
    todo: todo as string[],
    // 兼容旧报告缺失的优化亮点
    highlights: highlights as string[],
    // 兼容旧报告缺失的行动建议
    suggestions: suggestions as string[],
  };
};

// 仅识别实际符合报告契约的专用或兼容代码块
const REPORT_BLOCK_RE = /```(?:resume-report|json)\s*\n([\s\S]*?)\n```/g;
const parseReportJson = (content: string): ResumeReport | null => {
  try {
    return normalizeReport(JSON.parse(content));
  } catch {
    return null;
  }
};

// 从回复正文中提取有效报告；无效块不阻断后续报告，普通 JSON 不识别为报告
export const parseResumeReport = (content: string): ResumeReport | null => {
  if (!content) return null;
  for (const match of content.matchAll(REPORT_BLOCK_RE)) {
    const report = parseReportJson(match[1]!);
    if (report) return report;
  }
  return parseReportJson(content);
};

// 报告改动条目必须逐项匹配真实写入证据，避免把计划或失败操作列为成果。
export const validateResumeReportChanges = (
  content: string,
  evidence: ResumeAgentTaskEvidence[],
): string | null => {
  const report = parseResumeReport(content);
  if (!report) return "请按规定输出完整且有效的简历评分报告。";
  const verifiedChanges = evidence
    .filter((item) => item.kind === "resume_change" && !item.replayed &&
      item.changed === true && item.status !== "failed")
    .flatMap((item) => item.verifiedChanges ?? []);
  if (report.changes.length !== verifiedChanges.length ||
    report.changes.some((change, index) => change.module !== verifiedChanges[index]?.module ||
      change.summary !== verifiedChanges[index]?.summary)) {
    return `报告 changes 必须逐项使用工具确认的实际改动：${JSON.stringify(verifiedChanges)}。`;
  }
  return null;
};

// 仅移除有效报告，保留普通 JSON、无效报告与未完成的流式内容
export const stripResumeReportBlock = (content: string): string => {
  if (!content) return content;
  if (parseReportJson(content)) return "";
  return content.replace(REPORT_BLOCK_RE, (block, body: string) =>
    parseReportJson(body) ? "" : block).trim();
};
