import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "居中夹线", // 主题显示名称，与标题样式同名
  id: "academic" as const, // 主题编号
  design: ["single-column", "plain"], // 模板页归入极简分类
  description: "标题居中，两侧各延伸一条细线。", // 主题说明，描述标题样式
  ui: {
    theme: {
      color: "#0F766E",
      titleTemplate: "centeredSideRules", // 模块标题样式：居中夹线
    },
    font: { size: 15, lineHeight: 1.4 },
    content: { textAlign: "justify", dateStyle: "cn" },
  },
} satisfies ThemeTemplateConfig;
