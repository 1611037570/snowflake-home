import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "细纹信纸", // 主题显示名称
  id: "ruledPaper" as const, // 主题编号，供外观组件按编号选择
  design: ["single-column", "premium"], // 保留单栏布局，仅归入个性类型。
  description: "浅色横线纸纹理搭配通栏底线标题，正文如信笺般排布。", // 主题说明
  decisions: { // 主题固定外观，不进入用户界面配置
    layoutType: "topUserSingleColumn", // 个人信息置顶、正文单栏
    pageBackgroundPattern: "ruledPaper", // 主题固定页面纹理：横线纸
  },
  ui: { // 主题相对默认配置的差异
    theme: { // 主题色与标题绘制
      color: "#1F6F6B", // 主题色：墨绿用于标题底线与纸张横线
      titleTemplate: "titleUnderline", // 模块标题样式：复用已登记的通栏底线
    },
    page: { // 纸张留白
      padding: { // 纸张内边距
        vertical: 40, // 上下留白，给横线纸留出呼吸
        horizontal: 40, // 左右留白
      },
      spacing: { // 模块间距
        module: 22, // 模块之间的留白，避免横线穿过相邻模块
      },
    },
  },
} satisfies ThemeTemplateConfig;
