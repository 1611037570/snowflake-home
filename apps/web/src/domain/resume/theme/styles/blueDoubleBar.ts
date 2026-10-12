import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";
import businessSimple from "./businessSimple";

// 双蓝条标题沿用极简商务的单栏布局与默认个人信息外观。
export default {
  ...businessSimple,
  name: "蓝条极简", // 主题显示名称
  id: "blueDoubleBar" as const, // 主题编号
  description: "双蓝条与蓝色标题块突出模块名称的极简样式。", // 主题说明
  ui: {
    // 用户可调参数的主题默认值
    ...businessSimple.ui,
    theme: {
      // 主题颜色配置
      ...businessSimple.ui.theme,
      color: "#2196F3", // 标题块与竖条的默认蓝色
    },
  },
} satisfies ThemeTemplateConfig;
