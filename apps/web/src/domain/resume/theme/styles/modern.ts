import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "居中短横线", // 主题显示名称，与标题样式同名
  id: "modern" as const, // 主题编号
  design: ["single-column", "plain"], // 纯标题主题只归入单栏与极简分类
  description: "标题居中，下方一小段主题色短横线。", // 主题说明，描述标题样式
  ui: {
    theme: {
      color: "#2563EB",
      titleTemplate: "centeredShortRule", // 模块标题样式：居中短横线
    },
  },
} satisfies ThemeTemplateConfig;
