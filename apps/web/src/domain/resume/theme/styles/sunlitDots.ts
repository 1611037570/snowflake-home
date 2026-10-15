import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "晴点工坊", // 主题显示名称
  id: "sunlitDots" as const, // 主题编号
  design: ["two-column", "polished"], // 双栏与精致分类
  description: "浅色点阵纸、暖黄圆角标题与珊瑚色页眉线构成轻快的双栏履历。", // 主题说明
  decisions: { // 固定版式与纸张纹理
    layoutType: "topUserTwoColumn", // 个人信息通栏、正文双栏
    pageBackgroundPattern: "paperDots", // 复用独立点阵纸纹
    regions: { // 个人信息区域装饰留白
      user: { // 个人信息区域
        inset: { top: 0, right: 0, bottom: 0, left: 24 }, // 红线右侧保留文字间距
      },
    },
  },
  ui: { // 主题默认参数
    theme: { color: "#FFD64D", titleTemplate: "roundedLabel", titleIconMode: "none" }, // 黄色标题签
    page: { // 页面外观
      background: "#FFFFFF", // 白色纸张
      padding: { vertical: 42, horizontal: 54 }, // 页面边距
      spacing: { module: 21, paragraph: 9 }, // 正文间距
    },
    font: { color: "#24364F", size: 14, titleSize: 16, lineHeight: 1.6 }, // 深蓝正文排版
    layout: { // 双栏分配
      leftColumnWidth: 50, // 左栏宽度比例
      columns: { left: ["advantage", "work", "internship"], right: ["skill", "education", "project", "honor", "account"] }, // 模块所在栏
    },
    user: { infoMode: "none", infoLayout: "flex", infoPosition: "left", avatarPosition: "right" }, // 通用个人信息排列
  },
} satisfies ThemeTemplateConfig;
