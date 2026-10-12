import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "深色标签条", // 主题显示名称，与标题样式同名
  id: "business" as const, // 主题编号
  design: ["single-column", "plain"], // 移至极简分类
  description: "标题落在深灰实色标签上，右侧接浅灰底条。", // 主题说明，描述标题样式
  ui: {
    theme: {
      color: "#1E3A5F",
      titleTemplate: "darkLabelBar", // 模块标题样式：深色标签条
    },
    font: { size: 15 },
    page: { spacing: { module: 18 } },
    content: { dateStyle: "cn" },
  },
} satisfies ThemeTemplateConfig;
