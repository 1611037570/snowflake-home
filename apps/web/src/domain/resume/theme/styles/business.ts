import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "商务",
  id: "business" as const, // 主题编号
  design: ["single-column", "plain"], // 移至极简分类
  description: "适合职场与商务场景的正式简历样式。",
  ui: {
    theme: { color: "#1E3A5F" },
    font: { size: 15, titleSize: 21 },
    page: { spacing: { module: 18 } },
    content: { dateStyle: "cn" },
  },
} satisfies ThemeTemplateConfig;
