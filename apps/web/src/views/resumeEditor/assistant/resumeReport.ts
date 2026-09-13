// 一键优化报告数据结构与解析工具：协调编排技能输出与前端面板渲染
export interface ReportDimension {
  name: string;
  score: number | null;
}

export interface ReportCheck {
  level: "error" | "warning";
  message: string;
}

export interface ReportChange {
  module: string;
  summary: string;
}

// 一键优化产出的结构化报告，字段与 skill_resume_one_key_optimize 的输出约定保持一致
export interface ResumeReport {
  totalScore: number;
  dimensions: ReportDimension[];
  checks: ReportCheck[];
  changes: ReportChange[];
  todo: string[];
  highlights: string[];
  suggestions: string[];
}

// 报告特征：有效报告必须含数字总分与维度数组
const isReport = (v: unknown): v is ResumeReport =>
  !!v &&
  typeof v === "object" &&
  typeof (v as ResumeReport).totalScore === "number" &&
  Array.isArray((v as ResumeReport).dimensions);

// 报告可能以 resume-report 或 json 代码块输出，均尝试匹配
const REPORT_BLOCK_RES = [
  /```resume-report\s*\n([\s\S]*?)\n```/,
  /```json\s*\n([\s\S]*?)\n```/,
];
// 剥离时需移除的报告代码块
const REPORT_BLOCK_STRIP_RES = [
  /```resume-report\s*\n[\s\S]*?\n```\s*/g,
  /```json\s*\n[\s\S]*?\n```\s*/g,
];

// 从回复正文中提取并解析报告；兼容代码块与裸 JSON 输出，无有效报告时返回 null
export const parseResumeReport = (content: string): ResumeReport | null => {
  if (!content) return null;
  for (const re of REPORT_BLOCK_RES) {
    const match = content.match(re);
    if (!match) continue;
    try {
      const report = JSON.parse(match[1]!);
      return isReport(report) ? report : null;
    } catch {
      return null;
    }
  }
  // 裸 JSON 兜底
  try {
    const report = JSON.parse(content);
    return isReport(report) ? report : null;
  } catch {
    return null;
  }
};

// 从回复正文中移除报告代码块；整个正文为裸 JSON 报告时返回空
export const stripResumeReportBlock = (content: string): string => {
  if (!content) return content;
  let result = content;
  REPORT_BLOCK_STRIP_RES.forEach((re) => {
    result = result.replace(re, "");
  });
  const trimmed = result.trim();
  if (trimmed) {
    try {
      if (isReport(JSON.parse(trimmed))) return "";
    } catch {
      // 非 JSON 正文，保留
    }
  }
  return trimmed;
};
