import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "默认",
  id: "default" as const, // 主题编号
  design: ["single-column", "plain"], // 默认主题也归入极简分类
  description: "清晰通用的基础简历样式。",
} satisfies ThemeTemplateConfig;
