import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "建筑留白", // 主题显示名称
  id: "architectMargin" as const, // 主题编号
  design: ["single-column", "minimal"], // 单栏与简约分类
  description: "左侧标题栏与右侧正文并排，留白充足的单栏履历。", // 主题说明
  decisions: { // 固定页面版式
    layoutType: "topUserSingleColumn", // 个人信息置顶、正文单栏
  },
  ui: { // 主题默认参数
    theme: { color: "#1D2732", titleTemplate: "wideTrackingRule", titleIconMode: "none" }, // 复用现有宽字距标题
    page: { // 页面外观
      background: "#FFFFFF", // 白色纸张
      padding: { vertical: 63, horizontal: 66 }, // 页面边距
      spacing: { module: 42, paragraph: 15 }, // 正文间距
    },
    font: { color: "#647083", size: 14, titleSize: 14, lineHeight: 1.75 }, // 正文字体与行距
    user: { infoMode: "none", infoLayout: "flex", infoPosition: "left", avatarPosition: "right" }, // 通用个人信息排列
  },
} satisfies ThemeTemplateConfig;
