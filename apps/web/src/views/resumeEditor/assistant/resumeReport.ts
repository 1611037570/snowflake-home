// 一键优化报告数据结构与解析工具：协调编排技能输出与前端面板渲染
export interface ReportDimension {
  name: string;
  score: number;
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

// 报告代码块匹配：```resume-report 开头、``` 结尾
const REPORT_RE = /```resume-report\s*\n([\s\S]*?)\n```/;
const REPORT_BLOCK_RE = /```resume-report\s*\n[\s\S]*?\n```\s*/g;

// 从回复正文中提取并解析 resume-report 代码块；无有效报告时返回 null
export const parseResumeReport = (content: string): ResumeReport | null => {
  if (!content) return null;
  const match = content.match(REPORT_RE);
  if (!match) return null;
  try {
    const report = JSON.parse(match[1]!);
    if (typeof report?.totalScore !== "number" || !Array.isArray(report?.dimensions)) {
      return null;
    }
    return report as ResumeReport;
  } catch {
    return null;
  }
};

// 从回复正文中移除 resume-report 代码块，返回剩余正文供普通 Markdown 渲染
export const stripResumeReportBlock = (content: string): string => {
  if (!content) return content;
  return content.replace(REPORT_BLOCK_RE, "").trim();
};