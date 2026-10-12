import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "燕尾旗帜", // 主题显示名称，与标题样式同名
  id: "tealRibbon" as const, // 主题编号
  design: ["single-column", "plain"], // 模板筛选分类
  description: "标题从纸张左缘延伸，右端收成燕尾缺口。", // 主题说明，描述标题样式
  ui: {
    // 用户可调参数的主题默认值
    theme: {
      color: "#35B2BA",
      titleTemplate: "notchedBanner", // 模块标题样式：燕尾旗帜
    },
  },
} satisfies ThemeTemplateConfig;
