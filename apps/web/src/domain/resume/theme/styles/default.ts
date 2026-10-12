import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "竖条细线", // 主题显示名称，与标题样式同名
  id: "default" as const, // 主题编号
  design: ["single-column", "plain"], // 默认主题也归入极简分类
  description: "标题左侧一道主题色竖条，下接通栏细线。", // 主题说明，描述标题样式
  ui: {
    theme: {
      titleTemplate: "barUnderline", // 模块标题样式：竖条细线
    },
  },
} satisfies ThemeTemplateConfig;
