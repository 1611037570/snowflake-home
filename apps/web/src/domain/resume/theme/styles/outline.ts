import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "线框",
  id: "outline" as const, // 主题编号
  design: ["single-column", "minimal"],
  description: "以纯黑细线勾勒模块外边框的线框简历样式。",
  ui: {
    theme: {
      color: "#000000",
      titleTemplate: "boxedTitle", // 模块标题样式：框内标题
    },
    page: { spacing: { module: 48 } },
    content: { dateStyle: "cn" },
  },
} satisfies ThemeTemplateConfig;
