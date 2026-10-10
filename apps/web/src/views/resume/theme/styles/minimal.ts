import type { ThemeTemplateConfig } from "./createThemeTemplate";

export default {
  name: "简约",
  id: "minimal" as const, // 主题编号
  design: ["single-column", "minimal"],
  description: "减少视觉干扰，突出内容本身的简历样式。",
  ui: {
    theme: { color: "#111827" },
    page: {
      padding: { vertical: 30, horizontal: 30 },
      spacing: { paragraph: 6, module: 9 },
    },
  },
} satisfies ThemeTemplateConfig;
