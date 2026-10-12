import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";
import businessSimple from "./businessSimple";

// 双蓝条标题沿用极简商务的单栏布局与默认个人信息外观。
export default {
  ...businessSimple,
  name: "双方块条", // 主题显示名称，与标题样式同名
  id: "blueDoubleBar" as const, // 主题编号
  description: "两个小方块引导，标题落在同色实心条上。", // 主题说明，描述标题样式
  ui: {
    // 用户可调参数的主题默认值
    ...businessSimple.ui,
    theme: {
      // 主题颜色配置
      ...businessSimple.ui.theme,
      color: "#2196F3", // 标题块与竖条的默认蓝色
      titleTemplate: "twinSquareBar", // 模块标题样式：双方块条
    },
  },
} satisfies ThemeTemplateConfig;
