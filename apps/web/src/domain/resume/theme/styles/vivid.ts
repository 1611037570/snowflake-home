import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "活力",
  id: "vivid" as const, // 主题编号
  design: ["single-column", "polished"],
  description: "适合运营、市场与创意岗位的活力简历样式。",
  ui: {
    theme: {
      color: "#EA580C",
      titleTemplate: "roundedLabel", // 模块标题样式：圆角色块
    },
    font: { size: 17 },
    user: { infoMode: "icon" },
  },
} satisfies ThemeTemplateConfig;
