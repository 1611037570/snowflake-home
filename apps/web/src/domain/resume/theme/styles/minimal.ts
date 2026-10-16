import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "极细底线", // 主题显示名称，与标题样式同名
  id: "minimal" as const, // 主题编号
  design: ["single-column", "plain", "recommended"], // 保留单栏与极简风分类，同时加入推荐。
  description: "标题只有加宽字距与一条极细底线。", // 主题说明，描述标题样式
  ui: {
    theme: {
      color: "#111827",
      titleTemplate: "hairlineRule", // 模块标题样式：极细底线
    },
    page: {
      padding: { vertical: 30, horizontal: 30 },
      spacing: { paragraph: 6, module: 9 },
    },
  },
} satisfies ThemeTemplateConfig;
