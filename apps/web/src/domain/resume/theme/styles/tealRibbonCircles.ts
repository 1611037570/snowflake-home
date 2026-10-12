import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "燕尾双圆", // 主题显示名称
  id: "tealRibbonCircles" as const, // 主题编号
  design: ["single-column", "minimal"], // 单栏简约分类
  description: "燕尾旗帜标题搭配正文右上角双圆装饰。", // 主题说明
  ui: { // 主题默认界面配置
    theme: { // 主题配色与标题样式
      color: "#35B2BA", // 主题色
      titleTemplate: "notchedBanner", // 燕尾旗帜标题样式
    },
  },
} satisfies ThemeTemplateConfig;
