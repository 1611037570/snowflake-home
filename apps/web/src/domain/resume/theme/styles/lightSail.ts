import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "海蓝页眉", // 主题显示名称
  id: "lightSail" as const, // 主题编号
  design: ["single-column", "minimal"], // 单栏与简约分类
  description: "海蓝色英文页眉搭配圆条标题，个人信息保持通用布局。", // 主题说明
  decisions: { // 主题固定版式与首页装饰
    topDecoration: "lightSail", // 首页英文页眉组件
    layoutType: "topUserSingleColumn", // 个人信息与正文依次单栏排列
  },
  ui: { // 主题默认界面配置
    theme: { // 主题配色与正文标题样式
      color: "#244B68", // 页眉与正文标题的海蓝色
      titleTemplate: "barColorTitle", // 圆条标题样式
    },
    page: { // 页面留白
      padding: { vertical: 30, horizontal: 36 }, // 上下与左右页边距
    },
  },
} satisfies ThemeTemplateConfig;
