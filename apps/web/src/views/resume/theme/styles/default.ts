import type { ThemeTemplateConfig } from "./createThemeTemplate";

export default {
  name: "默认",
  id: "default" as const, // 主题编号
  design: ["single-column"],
  description: "清晰通用的基础简历样式。",
} satisfies ThemeTemplateConfig;
