import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";
import business from "./business";

// 沿用商务主题的页面参数，标题外观改由竖条粗线标题样式提供。
export default {
  ...business,
  name: "竖条粗线", // 主题显示名称，与标题样式同名
  id: "businessSimple" as const, // 主题编号
  design: ["single-column", "plain"], // 模板筛选分类
  description: "竖条引导，标题下方一条主题色粗线。", // 主题说明，描述标题样式
  ui: {
    // 用户可调参数的主题默认值
    ...business.ui,
    theme: {
      ...business.ui.theme,
      titleTemplate: "barHeavyRule", // 模块标题样式：竖条粗线
    },
  },
} satisfies ThemeTemplateConfig;
