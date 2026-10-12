import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "竖条底纹", // 主题显示名称，与标题样式同名
  id: "colorBar" as const, // 主题编号
  design: ["single-column", "plain"], // 移至极简分类
  description: "左侧竖条搭配标题行浅色底纹。", // 主题说明，描述标题样式
  ui: {
    theme: {
      color: "#475569",
      titleTemplate: "barTint", // 模块标题样式：竖条底纹
    },
    font: { size: 15, lineHeight: 1.3 },
    page: { spacing: { module: 18 } },
    content: { dateStyle: "cn" },
  },
} satisfies ThemeTemplateConfig;
