import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "帆影序章", // 主题显示名称
  id: "sailMasthead" as const, // 主题编号
  design: ["single-column", "polished"], // 单栏与精美分类
  description: "斜切深蓝页眉与帆影图形突出英文品牌，双线标题收束正文。", // 主题说明
  decisions: { // 主题固定版式与首页装饰
    topDecoration: "sailMasthead", // 首页品牌页眉组件
    layoutType: "topUserSingleColumn", // 个人信息与正文依次单栏排列
  },
  ui: { // 主题默认界面配置
    theme: { // 主题配色与正文标题样式
      color: "#173B55", // 页眉与标题的深蓝色
      titleTemplate: "doubleRuleTitle", // 双线标题样式
    },
    page: { // 页面留白
      padding: { vertical: 36, horizontal: 42 }, // 上下与左右页边距
    },
  },
} satisfies ThemeTemplateConfig;
