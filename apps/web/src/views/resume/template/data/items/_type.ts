// 大众模板文件名固定为：职位短码__年限短码__两位序号.ts。
export const resumeTemplateFileNameFormat = "{positionCode}__{experienceCode}__{serial}.ts";

// 职位短码用于文件命名，与职位筛选 key 一一对应。
export const resumeTemplatePositionCode = {
  all: "all",
  "web-frontend": "fe",
  java: "java",
  python: "py",
  javascript: "js",
  android: "android",
  ios: "ios",
  "dotnet-engineer": "dotnet",
  "csharp-engineer": "csharp",
  testing: "test",
  devops: "devops",
  "big-data": "bd",
  "algorithm-engineer": "algo",
  "data-analysis": "da",
  "cyber-security": "sec",
  embedded: "embedded",
  "product-manager": "pm",
  "ui-ux": "ux",
  "graphic-design": "gd",
  model: "model",
  operation: "op",
  "new-media": "nm",
  "copywriting-planning": "cp",
  "seo-sem": "seo",
  marketing: "mkt",
  "public-relations": "pr",
  "event-planning": "event",
  sales: "sales",
  "business-development": "bdv",
  "foreign-trade": "ft",
  "procurement-trade": "pt",
  "human-resources": "hr",
  administration: "admin",
  accounting: "acc",
  teacher: "tea",
  other: "other",
} as const;

// 年限短码中 0 代表在校学生，其余短码与工作年限筛选 key 保持一致。
export const resumeTemplateWorkExperienceCode = {
  student: "0",
  "0-1": "0-1",
  "1-3": "1-3",
  "3-5": "3-5",
  "5-10": "5-10",
  "10+": "10+",
} as const;
