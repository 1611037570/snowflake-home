import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";
import colorBar from "./colorBar";

// 沿用色条主题参数，仅取消标题左侧竖线。
export default {
  ...colorBar,
  name: "纯色条", // 主题显示名称
  id: "plainColorBar" as const, // 主题编号
  description: "以纯色底条突出模块标题，不绘制左侧竖线。", // 主题说明
} satisfies ThemeTemplateConfig;
